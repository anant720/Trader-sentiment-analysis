import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, Home, CheckSquare, Code2, User, Shield,
  SearchCheck, LayoutDashboard, CheckSquare2, Terminal, UserCircle2, ShieldCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const TABS = [
  { to: '/',        labelKey: 'nav.faculty', Icon: Search,        ActiveIcon: SearchCheck     },
  { to: '/hub',     labelKey: 'nav.hub',     Icon: Home,          ActiveIcon: LayoutDashboard },
  { to: '/tasks',   labelKey: 'nav.tasks',   Icon: CheckSquare,   ActiveIcon: CheckSquare2    },
  { to: '/dev',     labelKey: 'nav.dev',     Icon: Code2,         ActiveIcon: Terminal        },
  { to: '/profile', labelKey: 'nav.profile', Icon: User,          ActiveIcon: UserCircle2     },
];

export default function BottomNav() {
  const { t }    = useTranslation();
  const location = useLocation();
  const isAdmin  = useAuthStore(s => s.isAdmin);

  const tabs = [...TABS];
  if (isAdmin) {
    tabs.push({
      to: '/admin',
      label: 'Admin',
      Icon: Shield,
      ActiveIcon: ShieldCheck,
    });
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pb-3 z-[50]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="rounded-[24px] border border-[#7DA0CA] bg-[#FFFFFF] shadow-[0_4px_0_#021024] h-[68px] flex items-center justify-between px-2">
      {tabs.map(({ to, labelKey, label, Icon, ActiveIcon }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);
        const Ic = isActive ? ActiveIcon : Icon;

        return (
          <NavLink
            key={to}
            to={to}
            className={`flex-1 h-[52px] flex flex-col items-center justify-center rounded-[18px] transition-all ${isActive ? 'bg-[#C1E8FF]' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Ic
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? '#052659' : '#5483B3'}
            />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-[#052659]' : 'text-[#5483B3]'}`}>
              {labelKey ? t(labelKey) : label}
            </span>
          </NavLink>
        );
      })}
      </div>
    </nav>
  );
}
