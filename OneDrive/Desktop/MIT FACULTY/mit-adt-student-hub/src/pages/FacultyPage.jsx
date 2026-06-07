import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useFacultyStore from '../store/facultyStore';
import FacultyDetailSheet from '../components/faculty/FacultyDetailSheet';

export default function FacultyPage() {
  const fetchFaculty = useFacultyStore(s => s.fetchFaculty);
  const openDetail = useFacultyStore(s => s.openDetail);
  const allFaculty = useFacultyStore(s => s.allFaculty);
  const searchQuery = useFacultyStore(s => s.searchQuery);
  const activeDept = useFacultyStore(s => s.activeDept);
  const activeFloor = useFacultyStore(s => s.activeFloor);
  const activeWing = useFacultyStore(s => s.activeWing);
  const departments = useFacultyStore(s => s.departments);
  const isLoading = useFacultyStore(s => s.isLoading);
  const isAdmin = useAuthStore(s => s.isAdmin);
  const error = useFacultyStore(s => s.error);
  const setDeptFilter = useFacultyStore(s => s.setDeptFilter);
  const clearFilters = useFacultyStore(s => s.clearFilters);
  const setSearch = useFacultyStore(s => s.setSearch);
  const [value, setValue] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const list = useMemo(() => {
    let result = allFaculty || [];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(f =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.cabin || '').toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q)
      );
    }

    if (activeDept) result = result.filter(f => f.department === activeDept);
    if (activeFloor !== null) result = result.filter(f => f.floor === activeFloor);
    if (activeWing) result = result.filter(f => f.wing === activeWing);

    return result.sort((a, b) => {
      const rankA = a.rank ?? 5;
      const rankB = b.rank ?? 5;
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allFaculty, searchQuery, activeDept, activeFloor, activeWing]);

  return (
    <div className="pb-28 md:pb-0">
      {/* Header Area */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 px-4 pt-4 pb-4 md:px-8 md:pt-6">
        <div className="md:hidden">
          <h1 className="text-2xl font-bold tracking-tight mb-4 text-gray-900">Directory</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative h-12 md:h-14 md:max-w-xl rounded-xl bg-white shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSearch(e.target.value);
            }}
            placeholder="Search by name, dept, or cabin..."
            className="w-full h-full bg-transparent pl-12 pr-4 text-sm md:text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!activeDept ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} 
            onClick={clearFilters}
          >
            All
          </button>
          {departments.map((dept) => (
            <button 
              key={dept} 
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeDept === dept ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} 
              onClick={() => setDeptFilter(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-indigo-600 animate-spin" />
            <p className="text-gray-500 font-medium text-sm">Loading directory...</p>
          </div>
        ) : error ? (
          <div className="col-span-full py-8 rounded-xl border border-red-200 bg-red-50 px-5 text-center shadow-sm">
            <p className="text-red-900 text-base font-bold">Unable to load directory</p>
            <p className="text-red-700/80 text-sm mt-2 font-medium">{error}</p>
            <button onClick={fetchFaculty} className="mt-5 h-10 px-6 rounded-lg bg-red-600 text-white text-sm font-medium shadow-sm active:scale-95 transition-transform">
              Try Again
            </button>
          </div>
        ) : !list.length ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <Search size={24} className="text-gray-400 opacity-50" />
            </div>
            <p className="text-gray-900 text-lg font-bold tracking-tight">No faculty found</p>
            <p className="text-gray-500 text-sm mt-2 font-medium">Try adjusting your filters or search.</p>
          </div>
        ) : list.map((faculty) => {
          const initials = (faculty.name || 'F').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div 
              key={faculty.id}
              onClick={() => openDetail(faculty)}
              className="flex items-center gap-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-indigo-600 text-sm font-bold tracking-wider">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-base font-semibold line-clamp-1 tracking-tight">{faculty.name}</p>
                <p className="text-gray-500 text-xs font-medium truncate mt-0.5">{faculty.department}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="inline-flex items-center justify-center h-7 px-2.5 rounded bg-gray-100 border border-gray-200">
                  <span className="text-gray-700 text-xs font-semibold">{faculty.cabin || 'N/A'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <FacultyDetailSheet />
    </div>
  );
}
