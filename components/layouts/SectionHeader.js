export default function SectionHeader({ title, description, badge, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {badge && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-px bg-accent/20" />
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{badge}</p>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-black text-text-1 tracking-tighter leading-[0.95]">{title}</h2>
      {description && (
        <p className="text-xs md:text-sm text-text-3 font-black uppercase tracking-[0.2em] max-w-2xl leading-relaxed opacity-70">
          {description}
        </p>
      )}
    </div>
  );
}
