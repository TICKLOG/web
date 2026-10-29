// Days in a row played, with the animated campfire flame like on the old site.
export function Streak({ days }: { days: number }) {
  if (days < 1) return null;
  return (
    <span
      title={`${days} ${days === 1 ? "day" : "days"} in a row`}
      className="flex h-9 items-center gap-1.5 rounded-[10px] border border-search-border bg-search px-3 text-[14px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny animated game texture */}
      <img src="/streak-campfire.gif" alt="" width={20} height={20} className="-ml-0.5 [image-rendering:pixelated]" />
      <span className="font-semibold text-orange-400 tabular-nums">{days}</span>
    </span>
  );
}
