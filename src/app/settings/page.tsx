import type { Metadata } from "next";
import { DeleteAccount } from "@/components/delete-account";
import { PageHeader } from "@/components/page-header";
import { ThemePicker } from "@/components/theme";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata: Metadata = { title: "Settings" };

// The page builds up block by block (staggered by `delay`).
const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

function Section({
  title,
  description,
  delay,
  children,
}: {
  title: string;
  description: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section className={`mt-10 ${rise}`} style={{ animationDelay: `${delay}ms` }}>
      <h2 className="text-[17px] font-semibold text-heading">{title}</h2>
      <p className="mt-1 text-[14px] text-search-text">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const current = await getCurrentUser();
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader title="Settings" description="Customize your preferences." />

        <Section title="Theme" description="Choose how TickLog looks to you." delay={70}>
          <ThemePicker />
        </Section>

        {/* Only when logged in. */}
        {current && (
          <Section title="Delete Account" description="This removes everything linked to your TickLog account." delay={140}>
            <div className="flex items-center justify-between gap-6 rounded-[14px] border border-search-border p-5">
              <p className="text-[14px] text-search-text">Permanently delete your account and all of its data.</p>
              <DeleteAccount />
            </div>
          </Section>
        )}
      </div>
    </main>
  );
}
