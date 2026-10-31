import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { getSession } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

/** Password-only sign-in, outside the app shell (PRD AUTH-1, AUTH-8). */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getSession()) redirect("/");
  const { next } = await searchParams;

  return (
    // The sign-in panel and a student-focused journey preview.
    <main className="grid min-h-screen bg-surface min-[960px]:grid-cols-2">
      <div className="flex items-center justify-center px-8 py-12">
      <div className="flex w-full max-w-[400px] flex-col gap-8">
        <div className="flex flex-col items-start gap-2">
          <BrandMark className="size-10" />
          <div className="flex flex-col">
            <div className="font-serif text-[30px] font-semibold tracking-[-0.04em]">GradTrail</div>
            <div className="text-sm text-muted">Career search, with direction</div>
          </div>
        </div>
        <LoginForm next={typeof next === "string" ? next : undefined} />
        <p className="text-meta leading-[1.6] text-pretty text-muted">
          Your password is set on the server, as a hash in{" "}
          <code className="font-mono text-label">GRADTRAIL_PASSWORD</code>. Forgot it? Make a new hash with{" "}
          <code className="font-mono text-label">hash-password</code> and restart.
        </p>
      </div>
      </div>
      <div
        aria-hidden="true"
        className="login-field relative hidden overflow-hidden border-l border-line min-[960px]:flex min-[960px]:items-center min-[960px]:justify-center"
      >
        <div className="relative w-full max-w-[460px] px-12">
          <div className="mb-8 flex items-center gap-3">
            <BrandMark className="size-12" />
            <p className="text-label font-semibold tracking-[0.14em] text-primary-text">A CLEARER WAY FORWARD</p>
          </div>
          <h1 className="max-w-[390px] font-serif text-[42px] leading-[1.08] font-medium tracking-[-0.045em] text-ink">
            Your next role starts with one good lead.
          </h1>
          <p className="mt-4 max-w-[350px] text-lead text-muted">
            Find an opening, understand the original post, and decide on your next move.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-2 border-t border-line-strong pt-4 text-label text-muted">
            <span>Search roles</span>
            <span>Check the post</span>
            <span>Make your move</span>
          </div>
          <div aria-hidden="true" className="absolute -right-20 -bottom-44 size-[360px] rounded-full border border-line-strong" />
          <div aria-hidden="true" className="absolute -right-10 -bottom-34 size-[280px] rounded-full border border-line-card" />
        </div>
      </div>
    </main>
  );
}
