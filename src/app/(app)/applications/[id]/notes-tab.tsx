"use client";

import { useId, useState, useTransition } from "react";

import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import type { ActivityEntry } from "@/lib/activity";
import { statusInfo } from "@/lib/status";

import { addChecklistTask, addNote, deleteChecklistTask, deleteNote, restoreNote, saveChecklistPlan, setChecklistTaskDone, suggestChecklistPlan, updateNote } from "./actions";

/**
 * The Notes tab (E8-9, APP-14): private notes, each dated, with the
 * application's status changes and creation in one timeline, newest first.
 * Notes never go to the AI.
 */
export function NotesTab({
  applicationId,
  activity,
  checklistTasks = [],
}: {
  applicationId: string;
  activity: ActivityEntry[];
  checklistTasks?: { id: string; title: string; completed: boolean }[];
}) {
  const [draft, setDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [planDraft, setPlanDraft] = useState<string[] | null>(null);
  const [planRoadmaps, setPlanRoadmaps] = useState<{ label: string; url: string }[]>([]);
  const [planTaskDraft, setPlanTaskDraft] = useState("");
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const draftId = useId();
  const taskId = useId();
  const planTaskId = useId();

  const addTask = () => {
    if (!taskDraft.trim() || pending) return;
    startTransition(async () => {
      const result = await addChecklistTask({ id: applicationId, title: taskDraft });
      if (!result.ok) return toast(result.error);
      setTaskDraft("");
    });
  };

  const suggestPlan = () =>
    startTransition(async () => {
      const result = await suggestChecklistPlan({ id: applicationId });
      if (!result.ok) return void toast(result.error);
      setPlanDraft(result.data.tasks);
      setPlanRoadmaps(result.data.roadmaps);
    });

  const savePlan = () => {
    if (!planDraft?.length || planDraft.some((step) => !step.trim()) || pending) return;
    startTransition(async () => {
      const result = await saveChecklistPlan({ id: applicationId, tasks: planDraft });
      if (!result.ok) return void toast(result.error);
      setPlanDraft(null);
    });
  };

  const changeTask = (id: string, completed: boolean) =>
    startTransition(async () => {
      const result = await setChecklistTaskDone({ id: applicationId, taskId: id, completed });
      if (!result.ok) toast(result.error);
    });

  const removeTask = (id: string) =>
    startTransition(async () => {
      const result = await deleteChecklistTask({ id: applicationId, taskId: id });
      if (!result.ok) toast(result.error);
    });

  const add = () => {
    if (!draft.trim() || pending) return;
    startTransition(async () => {
      const result = await addNote({ id: applicationId, body: draft });
      if (!result.ok) return toast(result.error);
      setDraft("");
    });
  };

  const save = () => {
    if (!editing || pending) return;
    startTransition(async () => {
      const result = await updateNote({ id: applicationId, noteId: editing.id, body: editing.body });
      if (!result.ok) return toast(result.error);
      setEditing(null);
    });
  };

  // Gone at once, with Undo on the toast (as in the profile).
  const remove = (noteId: string) =>
    startTransition(async () => {
      const result = await deleteNote({ id: applicationId, noteId });
      if (!result.ok) return toast(result.error);
      toast("Note deleted.", {
        action: {
          label: "Undo",
          onClick: () => void restoreNote({ id: applicationId, ...result.data }).then((restored) => !restored.ok && toast(restored.error)),
        },
      });
    });

  return (
    <div className="@container flex flex-1 flex-col items-center gap-4 overflow-auto bg-canvas px-10 pt-11 pb-16">
      <div className="flex w-full max-w-[640px] flex-wrap justify-between gap-x-3 gap-y-1 text-meta text-muted">
        <span>Notes and activity</span>
        <span>Private and never sent to the AI</span>
      </div>
      <div className="flex w-full max-w-[640px] flex-col gap-5 rounded-panel border border-line-card bg-card px-[30px] py-7">
        <section aria-labelledby="prep-checklist-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 id="prep-checklist-title" className="text-[15px] font-medium">Application checklist</h2>
              <p className="mt-1 text-meta text-muted">Private to you. These tasks are never sent to an AI provider.</p>
            </div>
            {checklistTasks.length > 0 && (
              <span className="text-meta text-muted" aria-live="polite">
                {checklistTasks.filter((task) => task.completed).length} of {checklistTasks.length} done
              </span>
            )}
          </div>
          {checklistTasks.length === 0 ? (
            planDraft === null ? (
              <div className="rounded-card border border-dashed border-line-strong px-4 py-3">
                <p className="text-sm text-muted">Build an editable plan from the saved job post. It runs locally without AI; check each suggestion against the employer’s original instructions.</p>
                <Button variant="secondary" size="sm" className="mt-3" aria-disabled={pending || undefined} onClick={suggestPlan}>
                  Build my prep plan
                </Button>
              </div>
            ) : (
              <div role="region" aria-label="Review your prep plan" className="flex flex-col gap-3 rounded-card border border-line-card bg-surface p-4">
                <p className="text-sm text-muted">Review and edit these suggestions before adding them to your checklist.</p>
                {planRoadmaps.length > 0 && (
                  <div className="flex flex-col gap-1.5 rounded-card border border-line-card bg-card p-3">
                    <p className="text-label">Optional learning guides from roadmap.sh</p>
                    <p className="text-meta text-muted">Related to this role or its listed skills; these are learning resources, not requirements from the employer.</p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {planRoadmaps.map((roadmap) => (
                        <li key={roadmap.url}><a href={roadmap.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{roadmap.label}{" "}<span className="sr-only">(opens in a new tab)</span></a></li>
                      ))}
                    </ul>
                  </div>
                )}
                <ul className="flex flex-col gap-2">
                  {planDraft.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        aria-label={`Prep step ${index + 1}`}
                        value={step}
                        maxLength={160}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setPlanDraft((current) => current?.map((item, itemIndex) => itemIndex === index ? value : item) ?? null);
                        }}
                        className="min-w-0 flex-1 rounded-control border border-line-input bg-input px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-offset-0"
                      />
                      <button type="button" className="text-meta text-muted hover:text-danger" aria-label={`Remove prep step ${index + 1}`} onClick={() => setPlanDraft((current) => current?.filter((_, itemIndex) => itemIndex !== index) ?? null)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={planTaskId} className="text-label text-muted">Add a step</label>
                    <input id={planTaskId} value={planTaskDraft} maxLength={160} onChange={(event) => setPlanTaskDraft(event.currentTarget.value)} className="mt-1 w-full rounded-control border border-line-input bg-input px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-offset-0" />
                  </div>
                  <Button variant="secondary" size="sm" aria-disabled={!planTaskDraft.trim() || planDraft.length >= 12 || undefined} onClick={() => {
                    if (!planTaskDraft.trim() || planDraft.length >= 12) return;
                    setPlanDraft((current) => [...(current ?? []), planTaskDraft.trim()].slice(0, 12));
                    setPlanTaskDraft("");
                  }}>Add step</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" aria-disabled={!planDraft.length || planDraft.some((step) => !step.trim()) || pending || undefined} onClick={savePlan}>Save prep plan</Button>
                  <Button variant="text" size="sm" aria-disabled={pending || undefined} onClick={() => { setPlanDraft(null); setPlanRoadmaps([]); }}>Cancel</Button>
                </div>
              </div>
            )
          ) : (
            <ul aria-label="Application checklist tasks" className="flex flex-col divide-y divide-line border-y border-line">
              {checklistTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    aria-label={`${task.completed ? "Reopen" : "Complete"}: ${task.title}`}
                    onChange={(event) => changeTask(task.id, event.currentTarget.checked)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className={`min-w-0 flex-1 text-sm ${task.completed ? "text-muted line-through" : "text-ink"}`}>{task.title}</span>
                  <button type="button" className="text-meta text-muted hover:text-danger" aria-label={`Remove task: ${task.title}`} onClick={() => removeTask(task.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor={taskId} className="text-label text-muted">Add a task</label>
              <input
                id={taskId}
                value={taskDraft}
                maxLength={160}
                placeholder="e.g. Add my portfolio link"
                onChange={(event) => setTaskDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTask();
                  }
                }}
                className="mt-1 w-full rounded-control border border-line-input bg-input px-3 py-2 text-sm placeholder:text-muted focus-visible:border-primary focus-visible:outline-offset-0"
              />
            </div>
            <Button size="sm" aria-disabled={!taskDraft.trim() || pending || undefined} onClick={addTask}>Add task</Button>
          </div>
        </section>

        <div className="border-t border-line pt-5">
        <div className="flex flex-col gap-2.5">
          <label htmlFor={draftId} className="text-[15px] font-medium">
            Add a note
          </label>
          <textarea
            id={draftId}
            rows={3}
            value={draft}
            placeholder="Who you talked to, what they said, what's next…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                add();
              }
            }}
            className="w-full resize-y rounded-control border border-line-input bg-input px-3 py-2.5 text-sm leading-normal placeholder:text-muted focus-visible:border-primary focus-visible:outline-offset-0"
          />
          <div className="flex justify-end">
            <Button size="sm" aria-disabled={!draft.trim() || pending || undefined} onClick={add}>
              Add note
            </Button>
          </div>
        </div>

        <ol aria-label="Notes and activity" className="flex flex-col">
          {activity.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`} className="flex items-start gap-3 border-t border-line py-3.5">
              <span className="flex h-[1.4em] w-3 flex-none items-center justify-center" aria-hidden="true">
                {entry.kind === "status" ? (
                  <StatusDot status={entry.status} />
                ) : entry.kind === "created" ? (
                  <span className="size-2 rounded-full border border-faint" />
                ) : (
                  <span className="size-2 rounded-full bg-ink" />
                )}
              </span>
              {entry.kind === "note" ? (
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {editing?.id === entry.id ? (
                    <>
                      <textarea
                        aria-label="Edit note"
                        // Opened on request, so the text box takes focus.
                        autoFocus
                        rows={Math.max(3, editing.body.split("\n").length + 1)}
                        value={editing.body}
                        onChange={(event) => setEditing({ id: entry.id, body: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setEditing(null);
                          else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault();
                            save();
                          }
                        }}
                        className="w-full resize-y rounded-control border border-primary bg-input px-3 py-2.5 text-sm leading-normal focus-visible:outline-offset-0"
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" aria-disabled={pending || undefined} onClick={save}>
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm leading-[1.6] whitespace-pre-wrap">{entry.body}</p>
                      <p className="flex flex-wrap items-baseline gap-x-3 text-label text-muted">
                        <span>
                          {entry.date}
                          {entry.edited && " · edited"}
                        </span>
                        <button
                          type="button"
                          aria-label={`Edit the note from ${entry.date}`}
                          className="hover:text-ink"
                          onClick={() => setEditing({ id: entry.id, body: entry.body })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete the note from ${entry.date}`}
                          className="text-danger hover:text-error-strong"
                          onClick={() => remove(entry.id)}
                        >
                          Delete
                        </button>
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-3 text-sm">
                  <span>{entry.kind === "status" ? `Moved to ${statusInfo(entry.status).label}` : "Created"}</span>
                  <span className="text-label text-muted">{entry.date}</span>
                </p>
              )}
            </li>
          ))}
        </ol>
        </div>
      </div>
    </div>
  );
}
