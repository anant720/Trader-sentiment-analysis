import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, Home, CheckSquare, Code2, User, Shield,
  SearchCheck, LayoutDashboard, CheckSquare2, Terminal, UserCircle2, ShieldCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import arcusLogo from '../../assets/arcus_logo.png';

const TABS = [
  { to: '/',        labelKey: 'nav.faculty', Icon: Search,        ActiveIcon: SearchCheck     },
  { to: '/hub',     labelKey: 'nav.hub',     Icon: Home,          ActiveIcon: LayoutDashboard },
  { to: '/tasks',   labelKey: 'nav.tasks',   Icon: CheckSquare,   ActiveIcon: CheckSquare2    },
  { to: '/dev',     labelKey: 'nav.dev',     Icon: Code2,         ActiveIcon: Terminal        },
  { to: '/profile', labelKey: 'nav.profile', Icon: User,          ActiveIcon: UserCircle2     },
];

export default function Sidebar() {
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
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={arcusLogo}
            alt="Arcus"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Arcus
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {tabs.map(({ to, labelKey, label, Icon, ActiveIcon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          const Ic = isActive ? ActiveIcon : Icon;

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`}
            >
              <Ic
                size={20}
                className={isActive ? 'text-indigo-600' : 'text-gray-400'}
              />
              <span className="text-sm">
                {labelKey ? t(labelKey) : label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-3 bg-gray-50 rounded-lg flex flex-col">
           <span className="text-xs font-medium text-gray-900">Campus Companion</span>
           <span className="text-[10px] text-gray-500 mt-0.5">v1.1.0 Web Beta</span>
        </div>
      </div>
    </aside>
  );
}
