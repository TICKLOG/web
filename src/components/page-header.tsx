const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

// Title and subtitle at the top of a page; same position on every page.
export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className={rise}>
      <h1 className="text-2xl font-bold tracking-tight text-heading">{title}</h1>
      <p className="mt-1 text-[15px] text-search-text">{description}</p>
    </div>
  );
}
