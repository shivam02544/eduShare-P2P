export default function SectionHeader({ title, description, badge, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {badge && (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-px bg-indigo-500/20" />
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{badge}</p>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-text-1 tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-text-2 font-medium max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
