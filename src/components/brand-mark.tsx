import { cn } from "@/lib/cn";

/** Northstar's route mark: an open N leading toward a small northern star. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="64" height="64" rx="17" fill="#08110e" />
      <path d="M15 48V19l34 29V19" fill="none" stroke="#f2f7f4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d="m49 7 2.5 7.5L59 17l-7.5 2.5L49 27l-2.5-7.5L39 17l7.5-2.5L49 7Z" fill="#2ce4a0" />
    </svg>
  );
}
