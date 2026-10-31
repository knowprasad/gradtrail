"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast, toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";

import { setFollowUp } from "./applications/[id]/actions";

/** Clear a scheduled follow-up without opening its application. */
export function DashboardFollowUpDone({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      aria-label={`Mark follow-up done for ${label}`}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        startTransition(async () => {
          const result = toastResult(await setFollowUp({ id, date: "", note: "" }));
          setBusy(false);
          if (result.ok) {
            toast("Follow-up marked done.");
            router.refresh();
          }
        });
      }}
    >
      {busy ? "Saving…" : "Done"}
    </Button>
  );
}
