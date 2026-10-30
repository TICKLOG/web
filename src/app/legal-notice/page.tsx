import { LegalSection, OperatorList } from "@/components/legal";
import { PageHeader } from "@/components/page-header";

export default function LegalNoticePage() {
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader
          title="Legal Notice"
          description="Information according to § 5 ECG and § 25 MedienG."
        />

        <LegalSection title="Media Owner and Publisher" delay={70}>
          <OperatorList />
        </LegalSection>

        <LegalSection title="Purpose" delay={105}>
          <p>
            TickLog is a website and Minecraft mod for recording playtime and
            displaying player statistics. Basic orientation: information about
            Minecraft players and their playtime.
          </p>
        </LegalSection>

        <LegalSection title="Disclaimer" delay={140}>
          <p>
            <strong>
              Not an official Minecraft service. Not approved by or associated
              with Mojang or Microsoft.
            </strong>{" "}
            Minecraft is a trademark of Mojang AB. Skins, capes and player names
            are provided by Mojang.
          </p>
        </LegalSection>

        <LegalSection title="External Links" delay={175}>
          <p>
            TickLog contains links to external websites, including links added
            by players to their profiles. The respective operators are solely
            responsible for the content of these websites. Upon becoming aware
            of unlawful content, the corresponding link will be removed without
            delay.
          </p>
        </LegalSection>

        <LegalSection title="Source Code" delay={210}>
          <p>
            The source code of the website and the mod is available on{" "}
            <a href="https://github.com/TICKLOG">GitHub</a>.
          </p>
        </LegalSection>
      </div>
    </main>
  );
}
