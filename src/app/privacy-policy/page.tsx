import { LegalList, LegalSection, OperatorList } from "@/components/legal";
import { PageHeader } from "@/components/page-header";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="max-w-2xl">
        <PageHeader
          title="Privacy Policy"
          description="Information on the processing of personal data under the GDPR. Effective October 30, 2026."
        />

        <LegalSection title="Summary" delay={70}>
          <LegalList
            items={[
              "TickLog does not use advertising, analytics or tracking cookies.",
              "Personal data is not sold or disclosed for marketing purposes.",
              "Users can hide their profile, reset their playtime or delete their account at any time.",
            ]}
          />
        </LegalSection>

        <LegalSection title="Controller" delay={105}>
          <OperatorList />
        </LegalSection>

        <LegalSection title="Hosting and Delivery" delay={140}>
          <p>
            TickLog is hosted on a server in Frankfurt am Main, Germany.
            Requests are routed through <strong>Cloudflare</strong> (Cloudflare,
            Inc., USA) for protection against attacks and for faster delivery.
            In this process, Cloudflare processes IP addresses and technical
            request data. Cloudflare is certified under the EU-US Data Privacy
            Framework. The origin server does not keep access logs.
          </p>
          <p>
            Legal basis: legitimate interest in the secure and reliable
            operation of the website (Art. 6(1)(f) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Cookies and Local Storage" delay={175}>
          <p>
            Display preferences (theme and sidebar) are stored in the
            browser&apos;s local storage and are not transmitted to us. Cookies
            are only set upon login: a session cookie for authentication and a
            short-lived cookie that secures the linking of a Minecraft account.
            Both are strictly necessary and therefore do not require consent (§
            165(3) TKG 2021).
          </p>
        </LegalSection>

        <LegalSection title="Login via Discord" delay={210}>
          <p>
            Login takes place via Discord. We receive the Discord user ID,
            username and profile picture, but no email address. Authentication
            and the database are provided by <strong>Supabase</strong>{" "}
            (Supabase, Inc., USA) on servers in Ireland, on the basis of the EU
            Standard Contractual Clauses.
          </p>
          <p>
            Legal basis: performance of the user agreement (Art. 6(1)(b) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Linking Minecraft Accounts" delay={245}>
          <p>
            Minecraft accounts are linked via a Microsoft sign-in. We store the
            account&apos;s UUID, name and capes. The Microsoft access token is
            used only for this purpose and is not stored.
          </p>
          <p>
            Legal basis: performance of the user agreement (Art. 6(1)(b) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="TickLog Mod" delay={280}>
          <p>
            While the mod is installed and Minecraft is running, it transmits:
          </p>
          <LegalList
            items={[
              "the Minecraft UUID and name, verified through Mojang's authentication servers;",
              "the playtime per day, in intervals of up to one minute;",
              "the type of play (singleplayer, multiplayer or launcher) and the server address.",
            ]}
          />
          <p>
            Server addresses are verified with a status request. IP addresses as
            well as private and local servers count towards the total playtime
            but are never displayed. The mod&apos;s access token is stored
            exclusively as a hash.
          </p>
          <p>
            Legal basis: performance of the user agreement (Art. 6(1)(b) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Public Player Profiles" delay={315}>
          <p>
            Player profiles are publicly accessible and show name, UUID, skin,
            capes, playtime, top servers, badges, links, likes and views. Names,
            skins and capes are retrieved from Mojang&apos;s public interface.
            Skins are loaded directly from Mojang&apos;s servers, which thereby
            receive the visitor&apos;s IP address.
          </p>
          <p>
            In the account settings, users can hide their playtime or individual
            servers and manage their links at any time.
          </p>
        </LegalSection>

        <LegalSection title="Likes and Profile Views" delay={350}>
          <p>
            Likes are stored together with the TickLog account. To count unique
            profile views, we store a keyed one-way hash of the user ID or IP
            address; the IP address itself is not stored. These hashes are
            deleted at the end of each month. Views by the profile owner and by
            automated clients are not counted.
          </p>
          <p>
            Legal basis: legitimate interest in accurate view counts (Art.
            6(1)(f) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Retention" delay={385}>
          <LegalList
            items={[
              "Account, linked Minecraft accounts and likes: until the account is deleted in the settings.",
              "Playtime: until it is reset in the account settings or deleted upon request.",
              "Mod access tokens: replaced with every new login.",
            ]}
          />
        </LegalSection>

        <LegalSection title="Your Rights" delay={420}>
          <p>
            You have the right to access, rectification, erasure, restriction of
            processing, data portability and objection (Art. 15–21 GDPR).
            Requests can be sent to{" "}
            <a href="mailto:info@ticklog.net">info@ticklog.net</a>.
          </p>
          <p>
            You also have the right to lodge a complaint with the Austrian Data
            Protection Authority (Datenschutzbehörde, Barichgasse 40–42, 1030
            Vienna, <a href="https://dsb.gv.at">dsb.gv.at</a>).
          </p>
        </LegalSection>
      </div>
    </main>
  );
}
