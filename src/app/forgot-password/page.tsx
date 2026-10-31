import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reset your password" };

/** Recovery instructions for GradTrail's self-hosted, single-password setup. */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <section className="flex w-full max-w-[480px] flex-col gap-6">
        <div className="flex items-center gap-3">
          <BrandMark className="size-10" />
          <div>
            <p className="font-serif text-2xl font-semibold tracking-[-0.04em]">GradTrail</p>
            <p className="text-sm text-muted">Password recovery</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-line-card bg-card p-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[28px] leading-tight tracking-[-0.02em]">Reset your password</h1>
            <p className="text-sm leading-6 text-muted">
              This GradTrail install uses one password for the whole server, so there is no email address to send a reset link to. If you run this copy on your computer, you can safely choose a new password from its project folder.
            </p>
          </div>

          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-ink">
            <li>Open the GradTrail project folder in PowerShell.</li>
            <li>Run <code className="rounded bg-surface px-1.5 py-1 font-mono text-label">.\scripts\reset-password.ps1</code>.</li>
            <li>Enter and confirm a new password when prompted. It will not appear while you type.</li>
            <li>When the script says it is done, sign in with your new password.</li>
          </ol>

          <p className="text-meta leading-5 text-muted">
            The script updates the password hash in your local <code className="font-mono">.env</code> file and restarts the app. Your profile and applications stay in the database. If someone else hosts this GradTrail server, ask its administrator to reset the server password.
          </p>

          <Link href="/login" className={buttonClassName("secondary", "lg")}>
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
