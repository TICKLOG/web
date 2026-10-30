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

// Bordered list of label/value rows, like the lists in the settings.
export function InfoList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-search-border rounded-[14px] border border-search-border">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-6 px-5 py-3.5">
          <dt className="w-24 shrink-0 text-search-text">{label}</dt>
          <dd className="min-w-0 text-heading">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Name, address and email of the operator.
export function OperatorList() {
  return (
    <InfoList
      rows={[
        ["Name", OPERATOR.name],
        [
          "Address",
          OPERATOR.address.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          )),
        ],
        [
          "Email",
          <a key="email" href={`mailto:${OPERATOR.email}`}>
            {OPERATOR.email}
          </a>,
        ],
      ]}
    />
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
