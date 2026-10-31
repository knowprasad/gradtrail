"use client";

import { Popover } from "radix-ui";
import { useState, useTransition } from "react";

import { toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCalendarDate } from "@/lib/dates";

import { setFollowUp } from "./actions";

/** One user-set follow-up reminder; the dashboard surfaces it when due or within seven days. */
export function FollowUpReminder({ id, at, note }: { id: string; at: Date | null; note: string }) {
  const [open, setOpen] = useState(false);
  const [busy, startTransition] = useTransition();

  const save = (date: string, nextNote: string) => {
    startTransition(async () => {
      const result = toastResult(await setFollowUp({ id, date, note: nextNote }));
      if (result.ok) setOpen(false);
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={at ? `Follow-up reminder: ${formatCalendarDate(at)}. Change` : "Add a follow-up reminder"}
        className="flex items-center gap-2 rounded-full border border-line-control bg-card px-3.5 py-[9px] text-sm hover:border-line-strong data-[state=open]:border-primary"
      >
        {at ? <><span className="text-muted">Follow up</span><span className="font-medium">{formatCalendarDate(at)}</span></> : <span className="font-medium">+ Follow-up</span>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content aria-label="Follow-up reminder" align="end" sideOffset={8} collisionPadding={16} className="z-30 w-[min(320px,calc(100vw-32px))] rounded-card border border-line-popover bg-card p-5 shadow-menu">
          <FollowUpForm key={`${at?.toISOString() ?? ""}:${note}`} initialDate={at ? at.toISOString().slice(0, 10) : ""} initialNote={note} busy={busy} onSave={save} onCancel={() => setOpen(false)} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function FollowUpForm({ initialDate, initialNote, busy, onSave, onCancel }: {
  initialDate: string;
  initialNote: string;
  busy: boolean;
  onSave: (date: string, note: string) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(initialDate);
  const [note, setNote] = useState(initialNote);
  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); onSave(date, note); }}>
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-medium">Follow-up reminder</h2>
        <p className="text-meta text-muted">It appears on your dashboard when due or within seven days. No background service is needed.</p>
      </div>
      <Input type="date" label="Remind me on" value={date} onChange={(event) => setDate(event.target.value)} required />
      <Input label="What should you remember?" maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Ask about the interview timeline" />
      <div className="flex items-center gap-2">
        {initialDate && <Button type="button" variant="danger-text" size="sm" disabled={busy} onClick={() => onSave("", "")}>Mark done</Button>}
        <Button type="button" variant="secondary" size="sm" className="ml-auto" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={busy || !date}>{busy ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}
