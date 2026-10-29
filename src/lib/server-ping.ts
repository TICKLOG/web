import { lookup, resolveSrv } from "node:dns/promises";
import { BlockList, connect, isIP } from "node:net";

// Minimal Minecraft server list ping, only to read the favicon from the
// status JSON.

// Only public addresses get pinged, so the icon route can't be used to reach
// this server's own or internal network.
const PRIVATE = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["224.0.0.0", 3],
] as const)
  PRIVATE.addSubnet(net, prefix, "ipv4");
PRIVATE.addSubnet("::", 127, "ipv6");
PRIVATE.addSubnet("fc00::", 7, "ipv6");
PRIVATE.addSubnet("fe80::", 10, "ipv6");

function varint(n: number) {
  const out: number[] = [];
  let v = n >>> 0;
  do {
    let b = v & 0x7f;
    v >>>= 7;
    if (v) b |= 0x80;
    out.push(b);
  } while (v);
  return Buffer.from(out);
}

function readVarint(buf: Buffer, at: number): [number, number] | null {
  let value = 0;
  let shift = 0;
  for (let i = at; i < buf.length && shift < 35; i++) {
    value |= (buf[i] & 0x7f) << shift;
    if ((buf[i] & 0x80) === 0) return [value, i + 1];
    shift += 7;
  }
  return null;
}

function packet(id: number, payload: Buffer) {
  const body = Buffer.concat([varint(id), payload]);
  return Buffer.concat([varint(body.length), body]);
}

function str(s: string) {
  const b = Buffer.from(s, "utf8");
  return Buffer.concat([varint(b.length), b]);
}

function split(server: string): { host: string; port: number } {
  if (server.startsWith("[")) {
    const end = server.indexOf("]");
    const rest = server.slice(end + 1);
    return {
      host: server.slice(1, end),
      port: rest.startsWith(":") ? Number(rest.slice(1)) : 25565,
    };
  }
  const i = server.lastIndexOf(":");
  if (i > 0 && /^\d+$/.test(server.slice(i + 1)))
    return { host: server.slice(0, i), port: Number(server.slice(i + 1)) };
  return { host: server, port: 25565 };
}

type Status = { favicon?: string };

// Status JSON of a Minecraft server, or null when nothing answers like a
// Minecraft server.
export async function pingStatus(server: string): Promise<Status | null> {
  let { host, port } = split(server);
  if (!isIP(host)) {
    try {
      const srv = await resolveSrv(`_minecraft._tcp.${host}`);
      if (srv[0]) {
        host = srv[0].name;
        port = srv[0].port;
      }
    } catch {
      // no SRV record, use the address as is
    }
  }
  let address: { address: string; family: number };
  try {
    address = await lookup(host);
  } catch {
    return null;
  }
  if (PRIVATE.check(address.address, address.family === 6 ? "ipv6" : "ipv4"))
    return null;
  const ip = address.address;
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let done = false;
    const sock = connect({ host: ip, port });
    const finish = (v: Status | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      sock.destroy();
      resolve(v);
    };
    const timer = setTimeout(() => finish(null), 4000);
    sock.on("connect", () => {
      const handshake = packet(
        0,
        Buffer.concat([
          varint(770),
          str(host),
          Buffer.from([(port >> 8) & 255, port & 255]),
          varint(1),
        ]),
      );
      sock.write(Buffer.concat([handshake, packet(0, Buffer.alloc(0))]));
    });
    sock.on("data", (d: Buffer) => {
      chunks.push(d);
      const buf = Buffer.concat(chunks);
      const len = readVarint(buf, 0);
      if (!len) return;
      const [size, start] = len;
      if (buf.length < start + size) return;
      try {
        const id = readVarint(buf, start);
        if (!id || id[0] !== 0) return finish(null);
        const slen = readVarint(buf, id[1]);
        if (!slen) return finish(null);
        const json = buf.subarray(slen[1], slen[1] + slen[0]).toString("utf8");
        const status = JSON.parse(json) as Status;
        finish(status && typeof status === "object" ? status : null);
      } catch {
        finish(null);
      }
    });
    sock.on("error", () => finish(null));
    sock.on("close", () => finish(null));
  });
}

// Base64 PNG of the server icon, or null when the server has none or doesn't
// answer.
export async function pingFavicon(server: string): Promise<string | null> {
  const icon = (await pingStatus(server))?.favicon ?? "";
  const m = /^data:image\/png;base64,([\s\S]+)$/.exec(icon);
  return m ? m[1].replace(/\s/g, "") : null;
}
