import { RANK_COLORS, RANK_LABELS, RANK_ICONS } from '../../config/constants';

/**
 * Badge — displays a faculty's rank / role label.
 * rank: 1 (PVC) → 4 (HOD). Nothing shown for rank 5.
 */
export function RankBadge({ rank }) {
  if (!rank || rank === 5) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.15em] bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
    >
      {RANK_ICONS[rank]} {RANK_LABELS[rank]}
    </span>
  );
}

/**
 * CabinBadge — neutral pill showing the room number.
 */
export function CabinBadge({ cabin }) {
  if (!cabin) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-[11px] font-semibold tracking-wide uppercase">
      {cabin}
    </span>
  );
}

export default RankBadge;
