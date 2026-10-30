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

        <LegalSection title="About TickLog" delay={105}>
          <p>
            TickLog is a free, non-commercial website and Minecraft mod that
            tracks playtime and shows player stats. Its purpose is to inform
            about Minecraft players and their playtime.
          </p>
        </LegalSection>

        <LegalSection title="Not Affiliated With Mojang" delay={140}>
          <p>
            <strong>
              Not an official Minecraft service. Not approved by or associated
              with Mojang or Microsoft.
            </strong>{" "}
            Minecraft is a trademark of Mojang AB. Skins, capes and player names
            are loaded from Mojang.
          </p>
        </LegalSection>

        <LegalSection title="Links to Other Websites" delay={175}>
          <p>
            TickLog links to other websites, including the Twitch, YouTube, X
            and Discord links players add to their pages. Their operators are
            responsible for their content. If we learn of unlawful content
            behind a link, we remove the link.
          </p>
        </LegalSection>

        <LegalSection title="Source Code" delay={210}>
          <p>
            The website and the mod are open source on{" "}
            <a href="https://github.com/TICKLOG">GitHub</a>.
          </p>
        </LegalSection>
      </div>
    </main>
  );
}
