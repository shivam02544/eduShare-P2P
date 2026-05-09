export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8 space-y-12 sm:space-y-16 ${className}`}>
      {children}
    </div>
  );
}
