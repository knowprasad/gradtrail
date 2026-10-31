"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { isCurrent, NAV } from "@/lib/nav";

/** Touch-friendly, horizontally scrollable navigation on narrow screens. */
export function MobileNav({ counts = {} }: { counts?: Record<string, number> }) {
  const pathname = usePathname();
  const items = NAV.flatMap((group) => group.items);

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-line bg-sidebar/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(0_0_0/0.08)] backdrop-blur md:hidden">
      <div className="flex min-w-max items-stretch justify-around px-1">
        {items.map(({ href, label, icon: Icon, ...item }) => {
          const active = isCurrent({ href, label, icon: Icon, ...item }, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex min-h-[60px] w-[72px] flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium text-muted", active && "text-primary-text")}
            >
              <span className="relative">
                <Icon size={19} aria-hidden="true" />
                {counts[href] ? <span className="absolute -top-2 -right-2 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] leading-4 text-on-primary">{counts[href]}</span> : null}
              </span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
