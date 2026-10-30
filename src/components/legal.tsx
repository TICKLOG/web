const rise =
  "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

export const OPERATOR = {
  name: "Matthias Lettner",
  address: ["Fuchsenweg 4", "4320 Perg", "Upper Austria, Austria"],
  email: "info@ticklog.net",
};

// Titled block of a legal page; the page builds up block by block.
export function LegalSection({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mt-10 ${rise}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-[17px] font-semibold text-heading">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[14px] leading-6 text-search-text [&_a]:text-heading [&_a]:underline [&_a]:decoration-search-border [&_a]:underline-offset-4 [&_a:hover]:decoration-heading [&_strong]:font-medium [&_strong]:text-heading">
        {children}
      </div>
    </section>
  );
}

// Name, address and email of the operator, as a plain address block.
export function OperatorList() {
  return (
    <address className="text-[14px] leading-6 text-search-text not-italic">
      <strong className="block text-[15px]">{OPERATOR.name}</strong>
      {OPERATOR.address.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
      <a href={`mailto:${OPERATOR.email}`} className="mt-2 inline-block">
        {OPERATOR.email}
      </a>
    </address>
  );
}

// Bullet list with small dots in the text color.
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[11px] size-1 shrink-0 rounded-full bg-search-text" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
