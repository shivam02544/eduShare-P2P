export default function ResponsiveGrid({ children, columns = 3, className = "" }) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${columnClasses[columns] || columnClasses[3]} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
}
