// Shown in the content area while a page loads; the sidebar stays. Appears
// after a short delay so fast navigations don't flash it.
export function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="flex flex-1 items-center justify-center"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-8 animate-[appear_300ms_ease-out_200ms_backwards] motion-reduce:animate-none"
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          fill="none"
          strokeWidth="2.5"
          className="stroke-search-border"
        />
        {/* A quarter arc that spins around the track. */}
        <circle
          cx="16"
          cy="16"
          r="13"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="20 62"
          className="origin-center animate-[spin_800ms_linear_infinite] stroke-heading"
        />
      </svg>
    </main>
  );
}
