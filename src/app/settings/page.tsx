import { DeleteAccount } from "@/components/delete-account";
import { PageHeader } from "@/components/page-header";
import { SettingsRow, SettingsSection } from "@/components/settings-section";
import { ThemePicker } from "@/components/theme";
import { getCurrentUser } from "@/lib/auth/user";

export default async function SettingsPage() {
  const current = await getCurrentUser();
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader title="Settings" description="Customize your preferences." />

        <SettingsSection title="Theme" description="Choose how TickLog looks to you." delay={70}>
          <ThemePicker />
        </SettingsSection>

        {/* Only when logged in. */}
        {current && (
          <SettingsSection title="Delete Account" description="This removes everything linked to your TickLog account." delay={140}>
            <SettingsRow text="Permanently delete your account and all of its data.">
              <DeleteAccount />
            </SettingsRow>
          </SettingsSection>
        )}
      </div>
    </main>
  );
}
