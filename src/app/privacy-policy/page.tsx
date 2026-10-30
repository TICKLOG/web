import { LegalList, LegalSection, OperatorList } from "@/components/legal";
import { PageHeader } from "@/components/page-header";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader
          title="Privacy Policy"
          description="What TickLog stores about you, and why. Last updated October 30, 2026."
        />

        <LegalSection title="At a Glance" delay={70}>
          <LegalList
            items={[
              "No ads, no analytics and no tracking cookies.",
              "Your data is never sold or shared for marketing.",
              "You can hide your profile, reset your playtime or delete your account at any time.",
            ]}
          />
        </LegalSection>

        <LegalSection title="Who Is Responsible" delay={105}>
          <p>The controller under the GDPR is:</p>
          <OperatorList />
        </LegalSection>

        <LegalSection title="Visiting the Website" delay={140}>
          <p>
            TickLog runs on a server in Frankfurt, Germany. Requests pass
            through <strong>Cloudflare</strong> (Cloudflare, Inc., USA), which
            protects the site from attacks and delivers it faster. Cloudflare
            processes your IP address and technical request data for this.
            Cloudflare is certified under the EU-US Data Privacy Framework. Our
            server keeps no access logs.
          </p>
          <p>
            Legal basis: our legitimate interest in a secure and working website
            (Art. 6(1)(f) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Cookies and Local Storage" delay={175}>
          <p>
            Your theme and sidebar setting are saved in your browser&apos;s
            local storage and never sent to us. Cookies are only set when you
            log in: one keeps you logged in, and a short-lived one secures
            linking a Minecraft account. Both are strictly necessary, so no
            consent is needed (§ 165(3) TKG 2021).
          </p>
        </LegalSection>

        <LegalSection title="Discord Login" delay={210}>
          <p>
            You log in with Discord. We receive your Discord user ID, username
            and avatar, but not your email address. Logins and our database are
            run by <strong>Supabase</strong> (Supabase, Inc., USA) on servers in
            Ireland, under the EU Standard Contractual Clauses.
          </p>
          <p>Legal basis: providing your account (Art. 6(1)(b) GDPR).</p>
        </LegalSection>

        <LegalSection title="Linking Minecraft Accounts" delay={245}>
          <p>
            You link a Minecraft account by signing in with Microsoft. We save
            its UUID, name and capes. The Microsoft sign-in is only used once
            for this and is not stored.
          </p>
        </LegalSection>

        <LegalSection title="The TickLog Mod" delay={280}>
          <p>When you play with the mod installed, it sends us:</p>
          <LegalList
            items={[
              "Your Minecraft UUID and name, confirmed through Mojang's login servers.",
              "Your playtime per day, in steps of up to one minute.",
              "Whether you play singleplayer, on a server or in the launcher, and the server's address.",
            ]}
          />
          <p>
            We check server addresses with a short ping. IP addresses and
            private or local servers are counted but never shown. The mod&apos;s
            login key is only stored in hashed form.
          </p>
          <p>
            Legal basis: tracking your playtime, which you install the mod for
            (Art. 6(1)(b) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="Public Player Pages" delay={315}>
          <p>
            Every player page is public: name, UUID, skin, capes, playtime, top
            servers, badges, links, likes and views. Names, skins and capes of
            any player come from Mojang&apos;s public API. Skins load directly
            from Mojang&apos;s servers, which see your IP address.
          </p>
          <p>
            In your account settings you can hide your playtime or single
            servers, and add or remove links at any time.
          </p>
        </LegalSection>

        <LegalSection title="Likes and Views" delay={350}>
          <p>
            Likes are saved with your TickLog account. To count unique views, we
            store a one-way keyed hash of your TickLog user or your IP address,
            never the IP itself. These hashes are deleted when the month ends.
            Views of your own page and from bots are not counted.
          </p>
          <p>
            Legal basis: our legitimate interest in showing reliable view counts
            (Art. 6(1)(f) GDPR).
          </p>
        </LegalSection>

        <LegalSection title="How Long We Keep Data" delay={385}>
          <LegalList
            items={[
              "Your account, linked Minecraft accounts and likes: until you delete your account in the settings.",
              "Playtime: until you reset it in the account settings, or ask us to delete it.",
              "Mod logins: replaced on every new login.",
            ]}
          />
        </LegalSection>

        <LegalSection title="Your Rights" delay={420}>
          <p>
            You have the right to access, correct and delete your data, to
            restrict or object to its processing, and to receive it in a
            portable format (Art. 15–21 GDPR). Just email{" "}
            <a href="mailto:info@ticklog.net">info@ticklog.net</a>.
          </p>
          <p>
            You can also complain to the Austrian Data Protection Authority
            (Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna,{" "}
            <a href="https://dsb.gv.at">dsb.gv.at</a>).
          </p>
        </LegalSection>
      </div>
    </main>
  );
}
