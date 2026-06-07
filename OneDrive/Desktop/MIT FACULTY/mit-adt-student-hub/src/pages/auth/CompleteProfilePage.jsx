import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, School, Calendar, ArrowRight, Hash, BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { DEPARTMENTS } from '../../lib/facultyData';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const YEARS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', 
  'M.Tech', 'PhD'
];

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const needsProfile = useAuthStore(s => s.needsProfile);
  const completeProfile = useAuthStore(s => s.completeProfile);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);

  const [formData, setFormData] = useState({
    displayName: '',
    department: '',
    course: '',
    enrollment: '',
    roll: '',
    yearIndex: 0,
  });

  useEffect(() => {
    if (user && !needsProfile) {
      navigate('/', { replace: true });
    }
    if (user) {
      setFormData(prev => ({ ...prev, displayName: user.displayName || '' }));
    }
  }, [user, needsProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.department) return;

    await Haptics.impact({ style: ImpactStyle.Medium });

    const res = await completeProfile({
      displayName: formData.displayName,
      department: formData.department,
      course: formData.course,
      enrollment: formData.enrollment,
      roll: formData.roll,
      year: formData.yearIndex + 1
    });

    if (res.success) {
      await Haptics.notification({ type: 'success' });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side brand/gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 z-0"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Arcus</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">You're almost there.</h1>
          <p className="text-indigo-100 text-lg">Tell us a bit about your academic profile so we can personalize your experience.</p>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Arcus University</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white py-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Complete Profile</h1>
            <p className="text-gray-500 text-sm mt-2">Add your academic identity so the app can personalize your data.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                placeholder="E.g., Anant Suthar"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select 
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="" disabled>Select School</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <input
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="B.Tech CSE"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Enrollment</label>
                <input
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="ADT24..."
                  value={formData.enrollment}
                  onChange={e => setFormData({ ...formData, enrollment: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Roll</label>
                <input
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="05"
                  value={formData.roll}
                  onChange={e => setFormData({ ...formData, roll: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <div className="grid grid-cols-3 gap-2">
                {YEARS.map((year, idx) => (
                  <button
                    key={year}
                    type="button"
                    onClick={async () => {
                      await Haptics.impact({ style: ImpactStyle.Light });
                      setFormData({ ...formData, yearIndex: idx });
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      formData.yearIndex === idx 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="w-full p-4 mt-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-8"
            >
              {isLoading ? 'Saving...' : (
                <>
                  Complete Profile <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
