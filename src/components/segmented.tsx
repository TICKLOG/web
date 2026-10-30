"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./icon";

// Box of buttons with a pill that slides to the selected one.
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  return (
    <div className="relative flex h-10 items-center gap-1 rounded-[10px] border border-search-border bg-search p-1">
      {pill && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-[7px] bg-search-border transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={pill}
        />
      )}
      {options.map((o) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[o.id] = el;
          }}
          type="button"
          aria-pressed={o.id === value}
          disabled={o.disabled}
          title={o.disabled ? "Coming Soon" : undefined}
          onClick={() => onChange(o.id)}
          className={`relative flex h-full items-center gap-1.5 px-3 text-[14px] font-medium whitespace-nowrap transition-colors ${
            o.disabled
              ? "cursor-default text-nav-text opacity-40"
              : o.id === value
                ? "cursor-pointer text-heading"
                : "cursor-pointer text-nav-text hover:text-heading"
          }`}
        >
          {o.icon && <Icon className="size-4">{o.icon}</Icon>}
          {o.label}
        </button>
      ))}
    </div>
  );
}
