// The page builds up block by block (staggered by `delay`).
const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

// Titled block on settings pages.
export function SettingsSection({
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

// Bordered row with a text on the left and a control on the right.
export function SettingsRow({ text, children }: { text: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-[14px] border border-search-border p-5">
      <p className="text-[14px] text-search-text">{text}</p>
      {children}
    </div>
  );
}
