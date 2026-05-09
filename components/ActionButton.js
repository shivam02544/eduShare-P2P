"use client";

/**
 * A button that shows an inline spinner while loading.
 * Replaces any button that triggers an async action.
 */
export default function ActionButton({
  onClick,
  loading = false,
  loadingText,
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary", // "primary" | "secondary" | "ghost" | "danger"
  "aria-label": ariaLabel,
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-600 active:scale-95 transition-all duration-150",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      aria-disabled={loading || disabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      className={`${variants[variant]} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${className}`}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span>{loadingText || "Loading…"}</span>
        </>
      ) : children}
    </button>
  );
}
