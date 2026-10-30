"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

// Unique viewers this month. The view itself is counted from the browser, so
// prefetches and crawlers don't add to it.
export function ProfileViews({ uuid, views }: { uuid: string; views: number }) {
  const [count, setCount] = useState(views);
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid }),
    })
      .then((r) => r.json())
      .then((r: { views?: number }) => {
        if (typeof r.views === "number") setCount(r.views);
      })
      .catch(() => {});
  }, [uuid]);

  return (
    <span
      title={`${count} ${count === 1 ? "view" : "views"} this month`}
      className="flex h-9 items-center gap-2 rounded-[10px] border border-search-border bg-search px-3 text-[14px] text-search-text"
    >
      {/* Lucide "eye" */}
      <Icon className="size-4">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
      <span>
        <span className="font-semibold text-heading tabular-nums">{count}</span> / month
      </span>
    </span>
  );
}
