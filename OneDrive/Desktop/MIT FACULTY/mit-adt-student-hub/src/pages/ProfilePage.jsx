import useAuthStore from '../store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info, Mail, LogOut, User, BookOpen, GraduationCap, Hash, Shield, Bug, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import otaService from '../services/otaService';

export default function ProfilePage() {
  const profile = useAuthStore(s => s.profile);
  const user = useAuthStore(s => s.user);
  const isAdmin = useAuthStore(s => s.isAdmin);
  const signOut = useAuthStore(s => s.signOut);
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const checkForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage('Checking...');
    try {
      const updateInfo = await otaService.checkForUpdates();
      if (updateInfo) {
        setUpdateMessage(`Downloading v${updateInfo.version}...`);
        const success = await otaService.downloadAndInstall(updateInfo);
        if (success) {
          setUpdateMessage('Update applied! Restarting...');
        } else {
          setUpdateMessage('Update failed.');
        }
      } else {
        setUpdateMessage('Up to date!');
      }
    } catch (e) {
      setUpdateMessage('Check failed');
    }
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateMessage('');
    }, 3000);
  };



  const data = {
    name: profile?.displayName || user?.displayName || 'Student Name',
    course: profile?.course || 'B.Tech CSE',
    enrollment: profile?.enrollment || 'ADT24SOCB0141',
    roll: profile?.roll || '05',
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-28 pt-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-xl pb-4 mb-6" style={{ paddingTop: 'max(16px, var(--safe-top))' }}>
        <h1 className="text-[32px] font-black tracking-tight text-[var(--color-text)]">Settings</h1>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Profile Card Section */}
        <section className="bg-white rounded-[24px] border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <Row icon={User} label="Name" value={data.name} />
          <Divider />
          <Row icon={BookOpen} label="Course" value={data.course} />
        </section>

        <section className="bg-white rounded-[24px] border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <Row icon={GraduationCap} label="Enrollment" value={data.enrollment} />
          <Divider />
          <Row icon={Hash} label="Roll No" value={data.roll} />
        </section>

        {/* System & About Section */}
        <section className="bg-white rounded-[24px] border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <ActionRow
            icon={Mail}
            label="University Email"
            value={user?.email || 'Not available'}
          />

          <Divider />
          <ActionRow
            icon={Info}
            label="About App"
            value={otaService.currentVersion}
            onClick={() => setShowAbout(v => !v)}
            showArrow
          />
          <Divider />
          <ActionRow
            icon={RefreshCw}
            label="Check for Updates"
            value={updateMessage || "Check Now"}
            onClick={isCheckingUpdate ? null : checkForUpdates}
            showArrow={!isCheckingUpdate}
          />
          <Divider />
          <ActionRow
            icon={Bug}
            label="Report an Issue"
            value="Send Feedback"
            onClick={() => window.location.href = 'mailto:support@arcus.edu?subject=Arcus%20App%20Feedback'}
            showArrow
          />
        </section>

        <AnimatePresence>
          {showAbout && (
            <motion.section 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-gradient-to-br from-[var(--color-bg-secondary)] to-white rounded-[24px] border border-black/5 p-6 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] shadow-md flex items-center justify-center">
                  <Info size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[var(--color-text)] text-[18px] font-black tracking-tight">Arcus</p>
                  <p className="text-[var(--color-text-secondary)] text-[13px] font-bold">Premium Edition</p>
                </div>
              </div>
              <p className="text-[var(--color-text-secondary)] text-[14px] leading-relaxed font-medium">
                A highly polished, mobile-first campus utility designed for the modern student. Features instant faculty discovery, academic task tracking, and a stunning UI/UX system.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Admin Command Center */}
        {isAdmin && (
          <section className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 rounded-[24px] border border-red-100 dark:border-red-900/30 shadow-[0_4px_20px_rgba(239,68,68,0.05)] overflow-hidden">
            <ActionRow
              icon={Shield}
              label="Admin Command Center"
              value="Manage App"
              onClick={() => navigate('/admin')}
              showArrow
            />
          </section>
        )}

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="w-full h-14 rounded-[20px] bg-red-50 text-red-600 text-[16px] font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-100 mt-8"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Sign Out Securely
        </button>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-primary)]">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <p className="text-[var(--color-text)] text-[16px] font-bold flex-1">{label}</p>
      <p className="text-[var(--color-text-secondary)] text-[15px] font-semibold">{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-black/[0.04] mx-5" />;
}

function ActionRow({ icon: Icon, label, value, onClick, showArrow }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-5 py-4 flex items-center gap-4 text-left ${onClick ? 'active:bg-gray-50 transition-colors' : ''}`}
      type="button"
      disabled={!onClick}
    >
      <div className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--color-text)] text-[16px] font-bold">{label}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className="text-[var(--color-text-secondary)] text-[14px] font-medium truncate max-w-[120px]">{value}</p>
        {showArrow && onClick && <ChevronRight size={18} className="text-[var(--color-icon)]" />}
      </div>
    </button>
  );
}
