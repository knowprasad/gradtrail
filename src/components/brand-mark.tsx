import { cn } from "@/lib/cn";

/** GradTrail's G doubles as an open route, with a star marking the next step. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="64" height="64" rx="17" fill="#08110e" />
      <path d="M45 22a17 17 0 1 0 4 18H35v-8h19v20h-8v-5a25 25 0 1 1 4-29" fill="none" stroke="#f2f7f4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
      <path d="m49 7 2.5 7.5L59 17l-7.5 2.5L49 27l-2.5-7.5L39 17l7.5-2.5L49 7Z" fill="#2ce4a0" />
    </svg>
  );
}
