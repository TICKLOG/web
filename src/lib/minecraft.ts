// The player's locator bar color, as Minecraft derives it from the UUID.
export function locatorColor(uuid: string) {
  const hex = uuid.replace(/-/g, "");
  const hilo = BigInt(`0x${hex.slice(0, 16)}`) ^ BigInt(`0x${hex.slice(16)}`);
  const hash = Number(BigInt.asIntN(32, (hilo >> BigInt(32)) ^ hilo));
  const rgb = [(hash >> 16) & 0xff, (hash >> 8) & 0xff, hash & 0xff];
  const max = Math.max(...rgb);
  if (max === 0) return "#000000";
  const scale = Math.floor(0.9 * 255) / max;
  return `#${rgb.map((c) => Math.floor(c * scale).toString(16).padStart(2, "0")).join("")}`;
}
