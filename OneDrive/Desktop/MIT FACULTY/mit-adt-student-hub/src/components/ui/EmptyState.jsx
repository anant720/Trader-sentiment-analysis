import { SearchX } from 'lucide-react';

/**
 * EmptyState — shown when search/filter yields no results.
 */
export default function EmptyState({ icon: Icon = SearchX, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
        <Icon size={28} color="var(--color-text-tertiary)" />
      </div>
      <h3 className="text-[16px] font-bold text-[var(--color-text)] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-[13px] text-[var(--color-text-tertiary)] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
