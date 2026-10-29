"use client";

import { useEffect, useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/accounts";

// Deleting everything can't be undone, so the button asks for a second click.
// It keeps its width while doing so, so nothing around it moves.
export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  // Back to the normal state if the second click doesn't come.
  useEffect(() => {
    if (!confirming || pending) return;
    const timeout = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timeout);
  }, [confirming, pending]);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => (confirming ? startTransition(() => deleteAccount()) : setConfirming(true))}
      className={`flex h-9 w-[164px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[9px] text-[14px] font-medium whitespace-nowrap text-white transition-colors disabled:cursor-default disabled:opacity-60 ${
        confirming ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"
      }`}
    >
      {/* Lucide "trash-2" */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 shrink-0"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
      {pending ? "Deleting…" : confirming ? "Confirm Delete" : "Delete Account"}
    </button>
  );
}
