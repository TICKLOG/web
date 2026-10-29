// Microsoft account -> Xbox Live -> XSTS -> Minecraft profile.
// https://minecraft.wiki/w/Microsoft_authentication

export const MICROSOFT_AUTHORIZE_URL =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
export const MICROSOFT_TOKEN_URL =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
export const MICROSOFT_SCOPE = "XboxLive.signin offline_access";
// Holds the OAuth state and PKCE verifier between login and callback.
export const OAUTH_COOKIE = "ticklog_oauth";

export type MinecraftAuthErrorCode =
  | "no_xbox_account"
  | "child_account"
  | "xbox_unavailable"
  | "no_minecraft"
  | "failed";

export class MinecraftAuthError extends Error {
  constructor(
    public code: MinecraftAuthErrorCode,
    message: string,
  ) {
    super(message);
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    // XSTS explains refusals with an XErr code.
    const xerr = /"XErr"\s*:\s*(\d+)/.exec(text)?.[1];
    if (xerr === "2148916233") {
      throw new MinecraftAuthError("no_xbox_account", "Microsoft account has no Xbox profile");
    }
    if (xerr === "2148916238") {
      throw new MinecraftAuthError("child_account", "Child account must be added to a family");
    }
    if (xerr === "2148916235") {
      throw new MinecraftAuthError("xbox_unavailable", "Xbox Live is not available in this country");
    }
    throw new MinecraftAuthError("failed", `${url} responded ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

type XboxTokenResponse = {
  Token: string;
  DisplayClaims: { xui: { uhs: string }[] };
};

// The account's Minecraft profile, including every cape it owns.
export type MinecraftProfile = {
  uuid: string;
  name: string;
  capes: { url: string; alias: string }[];
};

export async function getMinecraftProfile(
  microsoftAccessToken: string,
): Promise<MinecraftProfile> {
  const xbl = await postJson<XboxTokenResponse>(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${microsoftAccessToken}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    },
  );

  const xsts = await postJson<XboxTokenResponse>(
    "https://xsts.auth.xboxlive.com/xsts/authorize",
    {
      Properties: { SandboxId: "RETAIL", UserTokens: [xbl.Token] },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    },
  );

  const userHash = xsts.DisplayClaims.xui[0].uhs;
  const minecraft = await postJson<{ access_token: string }>(
    "https://api.minecraftservices.com/authentication/login_with_xbox",
    { identityToken: `XBL3.0 x=${userHash};${xsts.Token}` },
  );

  const res = await fetch("https://api.minecraftservices.com/minecraft/profile", {
    headers: { Authorization: `Bearer ${minecraft.access_token}` },
  });
  if (res.status === 404) {
    throw new MinecraftAuthError("no_minecraft", "Account does not own Minecraft: Java Edition");
  }
  if (!res.ok) {
    throw new MinecraftAuthError("failed", `Minecraft profile responded ${res.status}`);
  }
  const profile = (await res.json()) as {
    id: string;
    name: string;
    capes?: { url: string; alias: string }[];
  };

  // The API returns the UUID without dashes.
  const uuid = profile.id.replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    "$1-$2-$3-$4-$5",
  );
  const capes = (profile.capes ?? []).map((c) => ({ url: c.url, alias: c.alias }));
  return { uuid, name: profile.name, capes };
}
