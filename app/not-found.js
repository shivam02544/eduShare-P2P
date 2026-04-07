import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
      <div className="animate-fade-in">
        <p className="text-8xl font-black text-zinc-100 select-none">404</p>
        <h1 className="text-2xl font-bold text-zinc-900 -mt-4">Page not found</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/explore" className="btn-secondary">Explore content</Link>
        </div>
      </div>
    </div>
  );
}
