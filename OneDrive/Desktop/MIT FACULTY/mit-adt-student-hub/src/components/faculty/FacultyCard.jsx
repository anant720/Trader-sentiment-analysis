import { motion } from 'framer-motion';
import { RankBadge, CabinBadge } from '../ui/Badge';
import { RANK_COLORS } from '../../config/constants';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function FacultyCard({ faculty, onClick }) {
  const { name, department, cabin, rank, isPVC, isVC, isDean, isHOD, departmentColor } = faculty;

  const topColor = rank <= 4 ? RANK_COLORS[rank] : (departmentColor || '#052659');
  const deptLabel = department && department.length > 10 ? department.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4) : (department || '');

  const handleTap = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    onClick();
  };

  return (
    <motion.div
      className="bg-[var(--color-bg-secondary)] rounded-[20px] overflow-hidden flex flex-col border border-[var(--color-border)]"
      onClick={handleTap}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* ── Color Block (Top 60%) ─────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ background: topColor, minHeight: '100px', padding: '16px 12px 10px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
        
        {rank <= 4 && (
          <div className="absolute top-2 left-2 z-10">
            <RankBadge rank={rank} />
          </div>
        )}

        <span
          className="text-white font-black text-[24px] tracking-tighter drop-shadow-md mt-4 select-none"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          {deptLabel}
        </span>
      </div>

      {/* ── Info Block (Bottom 40%) ─────────────────── */}
      <div
        className="px-3.5 py-3 flex flex-col gap-1.5 bg-[var(--color-bg-secondary)]"
      >
        <p
          className="text-[14px] font-black leading-tight text-[var(--color-text)] tracking-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </p>
        <CabinBadge cabin={cabin} />
      </div>
    </motion.div>
  );
}
