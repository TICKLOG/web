const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

// Centered page title with a short line below ("Coming Soon" by default),
// styled like the home page.
export function ComingSoon({ title, subtitle = "Coming Soon" }: { title: string; subtitle?: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 md:px-10">
      <div className={`text-center ${rise}`}>
        <h1 className="text-4xl leading-none font-bold sm:text-5xl tracking-tight text-heading">{title}</h1>
        <p className="mt-1.5 text-[17px] leading-7 text-search-text">{subtitle}</p>
      </div>
    </main>
  );
}
