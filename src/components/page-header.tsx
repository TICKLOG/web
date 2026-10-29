const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

// Title and subtitle at the top of a page; same position on every page. An
// optional icon sits left of the title.
export function PageHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={rise}>
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-heading">
        {icon}
        {title}
      </h1>
      <p className="mt-1 text-[15px] text-search-text">{description}</p>
    </div>
  );
}
