"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type AppShellProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ header, children }: AppShellProps) {
  const pathname = usePathname();
  const isGuestGuide = pathname.startsWith("/property/");

  // Set `--vh` to account for mobile browser address bars so 100% viewport
  // height can be calculated as `calc(var(--vh) * 100)` without extra scroll.
  useEffect(() => {
    function setVh() {
      try {
        document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
      } catch (e) {
        // ignore in non-browser environments
      }
    }

    setVh();
    window.addEventListener("resize", setVh, { passive: true });
    window.addEventListener("orientationchange", setVh, { passive: true });

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

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