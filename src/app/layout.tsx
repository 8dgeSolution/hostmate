
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "HostMate",
  description: "Short-stay guest guide builder for hosts and property teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const header = (
    <header className="mb-8 rounded-[2rem] border border-white/70 bg-[rgba(255,252,245,0.88)] px-4 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6 sm:py-5">
      <div className="hidden items-center justify-between gap-6 md:flex">
        <div>
          <Link href="/" className="inline-flex items-center text-2xl font-semibold tracking-tight text-[var(--accent-strong)]">
            <Image src="/brand/hostmate-logo.svg" alt="HostMate" className="h-10 w-auto" width={120} height={40} />
          </Link>
          <p className="mt-1 text-sm text-slate-600">Professional digital welcome books for short-stay properties.</p>
        </div>
        <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/88 p-2 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <Link href="/" className="rounded-full px-4 py-2 !text-white visited:!text-white hover:!text-white active:!text-white bg-[var(--accent)] transition hover:bg-[var(--accent-strong)]">
            Home
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-[var(--accent-strong)]">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 !text-white visited:!text-white hover:!text-white active:!text-white bg-[var(--accent)] transition hover:bg-[var(--accent-strong)]">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full px-4 py-2 !text-white visited:!text-white hover:!text-white active:!text-white bg-[var(--accent)] transition hover:bg-[var(--accent-strong)]">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-slate-950 px-4 py-2 font-medium !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-slate-800">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>

      <details className="group md:hidden">
        <summary className="flex list-none items-center justify-between gap-4 rounded-[1.4rem] px-1 py-1">
          <div>
            <Link href="/" className="inline-flex items-center text-xl font-semibold tracking-tight text-[var(--accent-strong)]">
              <Image src="/brand/hostmate-logo.svg" alt="HostMate" className="h-8 w-auto" width={96} height={32} />
            </Link>
            <p className="mt-1 text-xs text-slate-600">Digital welcome books for short stays.</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 text-slate-700 transition group-open:bg-slate-900 group-open:text-white">
            <Menu className="h-5 w-5" />
          </span>
        </summary>
        <nav className="mt-4 grid gap-2 border-t border-[var(--line)] pt-4 text-sm">
          <Link href="/" className="rounded-[1.15rem] bg-[var(--accent)] px-4 py-3 !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-[var(--accent-strong)]">
            Home
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="rounded-[1.15rem] bg-[var(--accent)] px-4 py-3 font-medium !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-[var(--accent-strong)]">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="w-full rounded-[1.15rem] border border-slate-200 bg-[var(--accent)] px-4 py-3 text-left !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-[var(--accent-strong)]">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-[1.15rem] bg-[var(--accent)] px-4 py-3 !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-[var(--accent-strong)]">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-[1.15rem] bg-slate-950 px-4 py-3 font-medium !text-white visited:!text-white hover:!text-white active:!text-white transition hover:bg-slate-800">
                Create account
              </Link>
            </>
          )}
        </nav>
      </details>
    </header>
  );

  return (
    <html lang="en">
      <body>
        <AppShell header={header}>{children}</AppShell>
      </body>
    </html>
  );
}