"use client";

import { usePathname } from "next/navigation";

type AppShellProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ header, children }: AppShellProps) {
  const pathname = usePathname();
  const isGuestGuide = pathname.startsWith("/property/");

  if (isGuestGuide) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {header}
      {children}
    </div>
  );
}