"use client";

// On/off toggle.
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-default disabled:opacity-60 ${
        checked ? "bg-nav-active dark:bg-heading" : "bg-search-border"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 size-4 rounded-full bg-background shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}
