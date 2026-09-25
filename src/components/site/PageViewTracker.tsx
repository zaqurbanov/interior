"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Counts one view per page per browser session (a reload is not a new view)
 * for the admin dashboard. Sends only the path; honours Do Not Track.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || navigator.doNotTrack === "1") return;
    const key = `vf-viewed:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    const body = JSON.stringify({ path: pathname });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [pathname]);
  return null;
}
