import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Shield, AlertCircle, Megaphone, Calendar, CheckCircle, Trash2, Plus, Users, Mail, GraduationCap, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

export default function AdminPage() {
  const user = useAuthStore(s => s.user);
  const [activeTab, setActiveTab ] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Content state
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [contentModal, setContentModal] = useState({ isOpen: false, type: null }); // type: 'announcements' | 'events'

  useEffect(() => {
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qEvents = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReports();
      unsubUsers();
      unsubAnnouncements();
      unsubEvents();
    };
  }, []);

  const resolveReport = async (reportId) => {
    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
      {/* Admin Header */}
      <div className="sticky top-0 z-10 px-6 py-6 bg-white border-b border-gray-200 shadow-sm md:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Command Center</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Administrator Access</p>
          </div>
        </div>

        {/* Mobile Tabs (Desktop uses sidebar/header context but we can keep tabs for switching views) */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          <TabButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
            icon={<AlertCircle size={16} />}
            label="Reports"
            count={reports.filter(r => r.status !== 'resolved').length}
          />
          <TabButton 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            icon={<Users size={16} />}
            label="Users"
            count={users.length}
          />
          <TabButton 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
            icon={<Megaphone size={16} />}
            label="Content"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between px-8 py-6">
         <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Administrator Access</p>
          </div>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
           <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<AlertCircle size={16} />} label="Reports" count={reports.filter(r => r.status !== 'resolved').length} />
           <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Users" count={users.length} />
           <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<Megaphone size={16} />} label="Content" />
        </div>
      </div>

      <div className="p-4 md:px-8 md:py-2 max-w-7xl mx-auto">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <EmptyState title="No reports filed" desc="The community is happy!" />
            ) : (
              reports.map(report => (
                <ReportCard key={report.id} report={report} onResolve={resolveReport} />
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm font-medium">No users found.</td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr 
                        key={u.id} 
                        onClick={() => setSelectedUser(u)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                              {(u.displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{u.displayName || 'Unnamed User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.enrollment || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.course || '-'}</td>
                        <td className="px-6 py-4">
                          <Badge variant={u.role === 'admin' ? 'purple' : 'blue'}>{u.role || 'student'}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            <ContentSection 
              title="Announcements" 
              icon={<Megaphone size={20} />} 
              items={announcements}
              collectionName="announcements"
              onAdd={() => setContentModal({ isOpen: true, type: 'announcements' })}
            />
            <ContentSection 
              title="Events" 
              icon={<Calendar size={20} />} 
              items={events}
              collectionName="events"
              onAdd={() => setContentModal({ isOpen: true, type: 'events' })}
            />
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Information" maxWidth="450px">
        {selectedUser && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                {(selectedUser.displayName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-[22px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                  {selectedUser.displayName || 'Unnamed User'}
                </h2>
                <Badge variant={selectedUser.role === 'admin' ? 'purple' : 'blue'} className="mt-2">
                  {selectedUser.role || 'student'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 flex items-center gap-3">
                <Mail className="text-zinc-400" size={20} />
                <div>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">{selectedUser.email}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 flex items-center gap-3">
                <GraduationCap className="text-zinc-400" size={20} />
                <div>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Enrollment Number</p>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">{selectedUser.enrollment || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Department</p>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedUser.department || '-'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Course & Year</p>
                  <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {selectedUser.course || '-'} • Year {selectedUser.year || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Content Creation Modal */}
      {contentModal.isOpen && (
        <ContentModal 
          type={contentModal.type} 
          onClose={() => setContentModal({ isOpen: false, type: null })} 
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
    >
      {icon} {label}
      {count > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">{count}</span>}
    </button>
  );
}

function ReportCard({ report, onResolve }) {
  return (
    <div className={`p-5 bg-white rounded-xl border border-gray-200 shadow-sm ${report.status === 'resolved' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="px-2 py-1 rounded bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
          ID: {report.facultyId?.substring(0, 8)}...
        </span>
        {report.status !== 'resolved' && (
          <button onClick={() => onResolve(report.id)} className="text-green-600 hover:bg-green-50 p-1 rounded-lg transition-colors">
            <CheckCircle size={20} />
          </button>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{report.reportType?.replace('_', ' ')}</h3>
      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{report.description}</p>
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
        Reported on {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : 'Recently'}
      </div>
    </div>
  );
}

function ContentSection({ title, icon, items, collectionName, onAdd }) {
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase().slice(0, -1)}?`)) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await updateDoc(doc(db, collectionName, id), { isActive: !currentStatus });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          {icon} <h2 className="text-[15px] font-black">{title}</h2>
        </div>
        <button onClick={onAdd} className="p-2 bg-primary text-white rounded-xl shadow-md active:scale-95 transition-transform">
          <Plus size={18} />
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="p-8 bg-zinc-100 dark:bg-zinc-900/50 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
          <p className="text-xs text-zinc-400 font-medium whitespace-pre-line">
            Click the [+] button above to post a new{'\n'}{title.toLowerCase()} to the hub.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-border flex items-center justify-between ${!item.isActive ? 'opacity-50' : ''}`}>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="text-[12px] text-zinc-500 mt-1 line-clamp-1">{item.description}</p>
                {item.date && <p className="text-[10px] text-primary font-bold mt-2 tracking-wider uppercase">Event Date: {item.date}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleActive(item.id, item.isActive)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${item.isActive ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                >
                  {item.isActive ? 'HIDE' : 'SHOW'}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
               </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentModal({ type, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);
    
    try {
      const data = {
        title,
        description,
        isActive: true,
        createdAt: serverTimestamp(),
      };
      
      if (type === 'events' && date) {
        data.date = date;
      }
      
      await addDoc(collection(db, type), data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to post content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Post ${type === 'announcements' ? 'Announcement' : 'Event'}`} maxWidth="400px">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-zinc-500 tracking-wider uppercase mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              required
              placeholder="e.g. Mid-term Exam Schedule"
            />
          </div>
          
          <div>
            <label className="text-[12px] font-bold text-zinc-500 tracking-wider uppercase mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[100px] resize-none dark:text-white"
              required
              placeholder="Add details here..."
            />
          </div>

          {type === 'events' && (
            <div>
              <label className="text-[12px] font-bold text-zinc-500 tracking-wider uppercase mb-1 block">Event Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                required
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-zinc-600 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-primary disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post to Hub'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <CheckCircle size={48} className="text-zinc-200 mb-4" />
      <h3 className="text-sm font-bold text-zinc-400">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1">{desc}</p>
    </div>
  );
}
