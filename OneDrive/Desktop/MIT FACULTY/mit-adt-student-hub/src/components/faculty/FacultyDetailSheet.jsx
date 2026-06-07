import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, AlertTriangle, Clock, DoorOpen, Building2, Crown, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { RankBadge } from '../ui/Badge';
import { RANK_COLORS, RANK_LABELS, RANK_ICONS, REPORT_TYPES } from '../../config/constants';
import useFacultyStore from '../../store/facultyStore';
import useAuthStore from '../../store/authStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import Toast, { useToast } from '../ui/Toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function FacultyDetailSheet() {
  const { t } = useTranslation();
  const isSheetOpen     = useFacultyStore(s => s.isSheetOpen);
  const selectedFaculty = useFacultyStore(s => s.selectedFaculty);
  const closeDetail     = useFacultyStore(s => s.closeDetail);
  const user            = useAuthStore(s => s.user);
  const { toast, show, hide } = useToast();

  const [copied, setCopied]     = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!selectedFaculty) return null;

  const { name, department, cabin, freeTimings, rank, departmentColor } = selectedFaculty;
  const bannerColor = rank <= 4 ? RANK_COLORS[rank] : (departmentColor || '#052659');

  async function copyCabin() {
    try {
      await navigator.clipboard.writeText(cabin);
      await Haptics.notification({ type: 'success' });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }

  async function submitReport() {
    if (!reportType || !reportDesc.trim()) return;
    setSubmitting(true);
    await Haptics.impact({ style: ImpactStyle.Medium });
    try {
      await addDoc(collection(db, COLLECTIONS.REPORTS), {
        facultyId:   selectedFaculty.id,
        facultyName: name,
        reportedBy:  user?.uid,
        reportType,
        description: reportDesc.trim().slice(0, 500),
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      await Haptics.notification({ type: 'success' });
      show(t('report.success'), 'success');
      setReporting(false);
      setReportType('');
      setReportDesc('');
    } catch (_) {
      show(t('report.error'), 'error');
    }
    setSubmitting(false);
  }

  return (
    <>
      <Modal isOpen={isSheetOpen} onClose={closeDetail}>
        {/* ── Creative Banner ─────────────────────────────── */}
        <div 
          className="relative px-6 pt-10 pb-8 overflow-hidden rounded-t-[32px] border-b border-black/5"
          style={{ backgroundColor: `${bannerColor}15` }}
        >
          {/* Ambient Glow */}
          <div 
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[40px] opacity-40 pointer-events-none"
            style={{ backgroundColor: bannerColor }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-wrap gap-2">
                {rank <= 4 && <RankBadge rank={rank} />}
                <span 
                  className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-sm"
                  style={{ backgroundColor: bannerColor, color: '#fff' }}
                >
                  {department}
                </span>
              </div>
              <button 
                onClick={closeDetail} 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                <X size={18} className="text-white" strokeWidth={3} />
              </button>
            </div>
            <h2 className="text-[34px] font-black text-[var(--color-text)] leading-[1.15] tracking-tighter drop-shadow-sm max-w-[90%]">
              {name}
            </h2>
          </div>
        </div>

        {/* ── Content ────────────────────────────── */}
        <div className="px-6 pb-8 bg-[var(--color-bg)]">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <InfoRow icon={DoorOpen}  label={t('faculty.cabin')}        value={cabin} />
            <InfoRow icon={Building2} label={t('faculty.department')}   value={department} />
            <InfoRow
              icon={Clock}
              label={t('faculty.free_timings')}
              value={freeTimings || '12:40–1:40 PM, after 3:30 PM'}
              className="col-span-2"
            />
            {rank <= 4 && (
              <InfoRow
                icon={Crown}
                label={t('faculty.role')}
                value={`${RANK_ICONS[rank]} ${RANK_LABELS[rank]}`}
                className="col-span-2"
              />
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-3">
            <button
              onClick={copyCabin}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-[20px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm font-bold text-[16px] text-[var(--color-text)] active:scale-[0.98] transition-all"
            >
              {copied ? <Check size={20} strokeWidth={3} className="text-green-500" /> : <Copy size={20} strokeWidth={2.5} />}
              {copied ? t('faculty.copied') : t('faculty.copy_cabin')}
            </button>

            <button
              onClick={async () => {
                await Haptics.impact({ style: ImpactStyle.Medium });
                setReporting(true);
              }}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-[20px] bg-red-500/10 border border-red-500/20 font-bold text-[16px] text-red-500 active:scale-[0.98] transition-all"
            >
              <AlertTriangle size={20} strokeWidth={2.5} />
              {t('faculty.report_error')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={reporting} onClose={() => setReporting(false)} title={t('report.title')}>
        <div className="p-6 pb-8 bg-[var(--color-bg)]">
          <div className="flex flex-col gap-2 mb-4">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.value}
                onClick={async () => {
                  await Haptics.impact({ style: ImpactStyle.Light });
                  setReportType(rt.value);
                }}
                className={`px-4 py-3.5 rounded-[16px] text-[14px] font-bold text-left transition-all active:scale-[0.98] border ${
                  reportType === rt.value
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)] shadow-md'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>

          <textarea
            value={reportDesc}
            onChange={e => setReportDesc(e.target.value.slice(0, 500))}
            placeholder={t('report.description_placeholder')}
            rows={3}
            className="w-full bg-[var(--color-bg)] rounded-[16px] p-4 text-[15px] font-medium outline-none border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-[var(--color-icon)] mb-4 text-[var(--color-text)]"
          />

          <div className="flex gap-3">
            <button 
              onClick={() => setReporting(false)} 
              className="flex-1 py-3.5 rounded-[16px] font-bold text-[15px] text-[var(--color-text-secondary)] bg-[var(--color-bg)] border border-[var(--color-border)] active:scale-95 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={submitReport}
              disabled={!reportType || !reportDesc.trim() || submitting}
              className="flex-1 py-3.5 rounded-[16px] bg-[var(--color-primary)] text-white font-black text-[15px] shadow-[0_4px_12px_rgba(5,38,89,0.2)] disabled:opacity-50 active:scale-95 transition-all"
            >
              {submitting ? '...' : t('report.submit')}
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hide} />
    </>
  );
}

function InfoRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 bg-[var(--color-bg-secondary)] rounded-[20px] p-4 border border-[var(--color-border)] shadow-sm ${className}`}>
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={2.5} className="text-[var(--color-icon)]" />
        <span className="text-[12px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[16px] font-black text-[var(--color-text)] leading-tight tracking-tight mt-1">{value}</span>
    </div>
  );
}
