"use client";

import { useState, useTransition } from "react";

import { toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";

import { saveInterviewPrep, suggestInterviewPrep } from "./actions";

export type InterviewPrepData = { id: string; prompt: string; notes: string };

export function InterviewPrep({
  applicationId,
  role,
  company,
  initialItems,
}: {
  applicationId: string;
  role: string;
  company: string;
  initialItems: InterviewPrepData[];
}) {
  const [items, setItems] = useState(initialItems.map(({ prompt, notes }) => ({ prompt, notes })));
  const [busy, startTransition] = useTransition();

  const suggest = () => startTransition(async () => {
    const result = await suggestInterviewPrep({ id: applicationId });
    if (!result.ok) {
      toastResult(result);
      return;
    }
    setItems(result.data.map((prompt) => ({ prompt, notes: "" })));
  });

  const save = () => startTransition(async () => {
    const result = await saveInterviewPrep({ id: applicationId, items });
    toastResult(result);
  });

  const update = (index: number, field: "prompt" | "notes", value: string) =>
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-8 @container">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-label font-medium uppercase tracking-wide text-primary">Practice pack</p>
          <h1 className="mt-2 font-serif text-2xl text-ink">Prepare for {role || "your interview"}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Work through prompts based on {company || "the employer"}’s saved posting. These are practice ideas, not confirmed interview questions.
          </p>
        </div>
        <Button variant="secondary" onClick={suggest} disabled={busy}>
          {busy ? "Working…" : items.length ? "Refresh suggestions" : "Build practice pack"}
        </Button>
      </div>

      <div className="mb-6 rounded-card border border-line bg-card px-4 py-3 text-sm leading-6 text-muted">
        Your notes stay in this application. Suggestions are generated locally from the saved posting and match data; no AI provider or paid service is used.
      </div>

      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-6 py-12 text-center">
          <h2 className="font-medium text-ink">Turn the job post into a practice session</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">We’ll suggest role and requirement prompts. You can edit them, add your own, and write answer notes in your own words.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <article key={index} className="rounded-card border border-line bg-card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-label font-medium text-muted">Practice prompt {index + 1}</span>
                <button type="button" className="text-label text-muted underline underline-offset-2 hover:text-ink" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </div>
              <label className="sr-only" htmlFor={`prep-prompt-${index}`}>Practice prompt {index + 1}</label>
              <textarea id={`prep-prompt-${index}`} value={item.prompt} maxLength={240} rows={2} onChange={(event) => update(index, "prompt", event.target.value)} className="w-full resize-y rounded-control border border-line bg-input px-3 py-2.5 text-sm leading-6 text-ink focus-visible:outline-2 focus-visible:outline-primary" />
              <label htmlFor={`prep-notes-${index}`} className="mb-2 mt-4 block text-label font-medium text-ink">Your answer notes</label>
              <textarea id={`prep-notes-${index}`} value={item.notes} maxLength={4000} rows={4} placeholder="Capture a real example: context, what you did, and the outcome…" onChange={(event) => update(index, "notes", event.target.value)} className="w-full resize-y rounded-control border border-line bg-input px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-primary" />
            </article>
          ))}
          {items.length < 12 && <Button variant="secondary" onClick={() => setItems((current) => [...current, { prompt: "", notes: "" }])}>Add your own prompt</Button>}
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <Button onClick={save} disabled={busy || items.some((item) => !item.prompt.trim())}>{busy ? "Saving…" : "Save practice pack"}</Button>
      </div>
    </section>
  );
}
