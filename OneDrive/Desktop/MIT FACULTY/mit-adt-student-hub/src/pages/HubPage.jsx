import { ArrowRight, Bell, CalendarDays, Search, Settings2, UserCircle2, Megaphone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import Modal from '../components/ui/Modal';

export default function HubPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const isAdmin = useAuthStore(s => s.isAdmin);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const qAnnouncements = query(
      collection(db, 'announcements'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qEvents = query(
      collection(db, 'events'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubAnnouncements();
      unsubEvents();
    };
  }, []);

  const actions = [
    {
      title: 'Faculty Search',
      subtitle: 'Find cabins, departments, and contacts fast.',
      icon: Search,
      tone: 'bg-[#F2F2F7]',
      to: '/',
    },
    {
      title: 'Campus Events',
      subtitle: 'See active event promotions and updates.',
      icon: CalendarDays,
      tone: 'bg-[#C1E8FF]',
      to: '/tasks',
    },
    {
      title: 'Profile',
      subtitle: 'See your student details and preferences.',
      icon: UserCircle2,
      tone: 'bg-[#F2F2F7]',
      to: '/profile',
    },
    {
      title: 'Settings',
      subtitle: 'About app, theme controls, and sign out.',
      icon: Settings2,
      tone: 'bg-[#C1E8FF]',
      to: '/profile',
    },
  ];

  return (
    <div className="pb-28 md:pb-0">
      {/* Desktop Header removed here since AppShell has it, but we can keep a nice greeting */}
      <div className="md:hidden flex items-start justify-between mb-6" style={{ paddingTop: 'max(16px, var(--safe-top))' }}>
        <div>
          <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-1">Welcome back</p>
          <h1 className="text-gray-900 text-3xl font-bold tracking-tight">{profile?.displayName?.split?.(' ')?.[0] || 'Student'}</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition-transform">
          <Bell size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-indigo-600 text-white shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 z-0"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-indigo-100 text-xs font-bold tracking-widest uppercase mb-2">Student Hub</p>
          <p className="text-white text-3xl font-bold tracking-tight max-w-[80%]">
            Everything you need, in one place.
          </p>
          <p className="text-indigo-100 mt-3 font-medium leading-relaxed max-w-xl">
            Access your faculty directory, track academic tasks, and manage your profile seamlessly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Announcements Grid */}
        {announcements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Latest Announcements</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {announcements.map(ann => (
                <button 
                  key={ann.id} 
                  onClick={() => setSelectedContent({ type: 'Announcement', ...ann })}
                  className="text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Megaphone size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight mb-2">{ann.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ann.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map(ev => (
                <button 
                  key={ev.id} 
                  onClick={() => setSelectedContent({ type: 'Event', ...ev })}
                  className="text-left bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border border-indigo-50">
                      <span className="text-[10px] font-bold uppercase text-red-500 leading-none mb-1">
                        {ev.date ? new Date(ev.date).toLocaleString('default', { month: 'short' }) : 'TBA'}
                      </span>
                      <span className="text-lg font-black text-gray-900 leading-none">
                        {ev.date ? new Date(ev.date).getDate() : '-'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight mb-2">{ev.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ev.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Detail Modal */}
      <Modal isOpen={!!selectedContent} onClose={() => setSelectedContent(null)} title={selectedContent?.type || 'Details'} maxWidth="500px">
        {selectedContent && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${selectedContent.type === 'Event' ? 'bg-indigo-600' : 'bg-red-500'}`}>
                {selectedContent.type === 'Event' ? <Calendar size={24} /> : <Megaphone size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {selectedContent.title}
                </h2>
                {selectedContent.date && (
                  <p className="text-sm font-medium text-indigo-600 mt-1">
                    Date: {new Date(selectedContent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {selectedContent.description}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedContent(null)}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
