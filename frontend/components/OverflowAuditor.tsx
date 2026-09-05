"use client";

import { useEffect } from "react";

/**
 * Automated Overflow Auditor
 * Continuously validates that document.documentElement.scrollWidth === window.innerWidth.
 * When an overflow occurs at any viewport size, it traverses the DOM, identifies the exact
 * offending elements, and logs them to the console.
 */
export function OverflowAuditor() {
  useEffect(() => {
    function audit() {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const diff = docWidth - winWidth;

      // Allow 1px tolerance for subpixel rendering in some browser engines
      if (diff > 1) {
        const culprits: { tag: string; className: string; id: string; width: number; right: number }[] = [];
        const all = document.querySelectorAll("*");

        all.forEach((el) => {
          if (el instanceof HTMLElement || el instanceof SVGElement) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winWidth + 1 || rect.width > winWidth + 1) {
              culprits.push({
                tag: el.tagName.toLowerCase(),
                className: typeof el.className === "string" ? el.className : "",
                id: el.id || "",
                width: Math.round(rect.width),
                right: Math.round(rect.right),
              });
            }
          }
        });

        console.warn(
          `[Overflow Auditor ⚠️] Horizontal overflow detected! Window: ${winWidth}px, Document: ${docWidth}px (overflow +${diff}px). Culprits (${culprits.length}):`,
          culprits.slice(0, 10)
        );
      } else {
        console.log(`[Overflow Auditor ✅] Layout conforms to viewport: ${winWidth}px (scrollWidth: ${docWidth}px)`);
      }
    }

    // Run audit on load, after paint, and on viewport resize
    audit();
    const timeoutId = setTimeout(audit, 500);
    window.addEventListener("resize", audit);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", audit);
    };
  }, []);

  return null;
}
