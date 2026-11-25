"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * RefreshRedirect:
 * Whenever the user refreshes (reloads) the website on any subpage,
 * automatically redirects them back to the Home page ('/').
 * Regular client-side SPA navigation between pages is preserved.
 */
export default function RefreshRedirect() {
  const router = useRouter();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    if (typeof window === "undefined") return;

    try {
      const navEntries = performance.getEntriesByType("navigation");
      const isReload =
        (navEntries && navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload") ||
        (window.performance && "navigation" in window.performance && (window.performance as unknown as { navigation?: { type: number } }).navigation?.type === 1);

      if (isReload && window.location.pathname !== "/") {
        window.location.replace("/");
      }
    } catch (e) {
      console.warn("Refresh redirect check failed:", e);
    }
  }, [router]);

  return null;
}
