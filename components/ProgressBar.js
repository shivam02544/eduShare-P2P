"use client";
import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 80, minimum: 0.15 });

function Inner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prev = useRef(null);

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (prev.current && prev.current !== current) {
      NProgress.start();
    }
    prev.current = current;
    // Small delay so it feels snappy, not laggy
    const t = setTimeout(() => NProgress.done(), 100);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}

export default function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
