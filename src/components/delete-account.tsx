"use client";

import { deleteAccount } from "@/app/actions/accounts";
import { DangerButton } from "./danger-button";

export function DeleteAccount() {
  return (
    <DangerButton label="Delete Account" confirmLabel="Confirm Delete" pendingLabel="Deleting…" action={deleteAccount} />
  );
}
