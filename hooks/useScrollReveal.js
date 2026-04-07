"use client";
import { useEffect, useRef } from "react";

/**
 * Reveals elements as they scroll into view.
 * Usage: attach ref to a container, children with .reveal class animate in.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // only animate once
          }
        });
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || "0px 0px -40px 0px" }
    );

    // Observe direct children with .reveal class, or the element itself
    const targets = el.querySelectorAll(".reveal");
    if (targets.length > 0) {
      targets.forEach((t) => observer.observe(t));
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
