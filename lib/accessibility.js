/**
 * EduShare Accessibility Utilities
 * ─────────────────────────────────
 * Reusable hooks and helpers for WCAG 2.1 AA compliance.
 * Import from this module to prevent future accessibility regressions.
 */

import { useEffect, useRef, useCallback } from "react";

// ── Focus Trap ─────────────────────────────────────────────────────────────
/**
 * useFocusTrap
 * Traps keyboard focus within a container element when active.
 * Supports Tab, Shift+Tab, and Escape.
 *
 * @param {boolean} active - Whether the trap is currently active
 * @param {Function} onEscape - Callback when Escape is pressed
 * @returns {React.RefObject} Ref to attach to the container element
 */
export function useFocusTrap(active, onEscape) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    const FOCUSABLE = [
      'a[href]',
      'button:not([disabled]):not([aria-hidden="true"])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE));

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Move focus into the container on activation
    const focusable = getFocusable();
    if (focusable.length > 0 && !container.contains(document.activeElement)) {
      focusable[0].focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);

  return containerRef;
}

// ── Restore Focus ───────────────────────────────────────────────────────────
/**
 * useRestoreFocus
 * Saves and restores focus to the element that was active before
 * a modal/dialog/overlay was opened.
 *
 * Call restoreFocus() when closing the overlay.
 */
export function useRestoreFocus() {
  const savedRef = useRef(null);

  const saveFocus = useCallback(() => {
    savedRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (savedRef.current && typeof savedRef.current.focus === "function") {
      savedRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
}

// ── Escape Key Handler ──────────────────────────────────────────────────────
/**
 * useEscapeKey
 * Calls `callback` when the Escape key is pressed, if `active`.
 *
 * @param {boolean} active
 * @param {Function} callback
 */
export function useEscapeKey(active, callback) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (e.key === "Escape") callback?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, callback]);
}

// ── Outside Click ───────────────────────────────────────────────────────────
/**
 * useOutsideClick
 * Calls `callback` when a click occurs outside the ref element.
 *
 * @param {React.RefObject} ref
 * @param {Function} callback
 * @param {boolean} active
 */
export function useOutsideClick(ref, callback, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback, active]);
}

// ── Roving TabIndex (for listboxes, toolbars, etc.) ──────────────────────────
/**
 * useRovingTabIndex
 * Manages roving tabIndex for a list of items.
 * Supports ArrowUp, ArrowDown, Home, End.
 *
 * Returns current activeIndex and keyboard handler.
 */
export function useRovingTabIndex(count, onSelect) {
  const activeIndexRef = useRef(0);

  const handleKeyDown = useCallback((e, currentIndex) => {
    let next = currentIndex;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        next = (currentIndex + 1) % count;
        break;
      case "ArrowUp":
        e.preventDefault();
        next = (currentIndex - 1 + count) % count;
        break;
      case "Home":
        e.preventDefault();
        next = 0;
        break;
      case "End":
        e.preventDefault();
        next = count - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect?.(currentIndex);
        return;
      default:
        return;
    }

    activeIndexRef.current = next;
    return next;
  }, [count, onSelect]);

  return { handleKeyDown };
}

// ── Live Region Announcer ───────────────────────────────────────────────────
/**
 * announce
 * Imperatively announces a message to screen readers via an aria-live region.
 * Creates and removes a temporary live region element.
 *
 * @param {string} message
 * @param {"polite"|"assertive"} [priority="polite"]
 */
export function announce(message, priority = "polite") {
  if (typeof document === "undefined") return;

  const id = "edu-sr-announcer";
  let el = document.getElementById(id);

  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", priority);
    el.setAttribute("aria-atomic", "true");
    Object.assign(el.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      margin: "-1px",
      padding: "0",
      overflow: "hidden",
      clip: "rect(0,0,0,0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(el);
  }

  el.setAttribute("aria-live", priority);
  // Trick screen readers into re-announcing by clearing first
  el.textContent = "";
  requestAnimationFrame(() => { el.textContent = message; });
}

// ── Form Field Error ID Helper ──────────────────────────────────────────────
/**
 * getFieldIds
 * Generates consistent IDs for form field accessibility attributes.
 *
 * Usage:
 *   const { inputId, errorId, descId } = getFieldIds("email");
 *   <label htmlFor={inputId}>Email</label>
 *   <input id={inputId} aria-describedby={`${descId} ${errorId}`} />
 *   <span id={errorId} role="alert">{error}</span>
 */
export function getFieldIds(name) {
  return {
    inputId: `field-${name}`,
    errorId: `field-${name}-error`,
    descId: `field-${name}-desc`,
  };
}
