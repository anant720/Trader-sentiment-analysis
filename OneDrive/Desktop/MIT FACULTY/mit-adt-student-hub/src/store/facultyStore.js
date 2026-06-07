import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// Debounce timer for search
let debounceTimer = null;

const useFacultyStore = create((set, get) => ({
  // Data State
  allFaculty: [],
  departments: [],
  floors: [],
  wings: [],
  isLoading: false,
  error: null,

  // Filters State
  searchQuery: '',
  activeDept: null,
  activeFloor: null,
  activeWing: null,
  selectedFaculty: null,
  isSheetOpen: false,

  // Derived: Filtered and Sorted list
  get filtered() {
    return get()._computeFiltered();
  },

  // Actions
  async fetchFaculty() {
    // Prevent redundant fetches
    if (get().allFaculty.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      let snapshot = await getDocs(query(collection(db, 'faculty')));

      // Some projects use "faculties" as collection name.
      if (snapshot.empty) {
        snapshot = await getDocs(query(collection(db, 'faculties')));
      }

      const data = snapshot.docs.map(doc => {
        const row = doc.data();
        return {
          id: doc.id,
          ...row,
          // Normalize legacy fields if present.
          department: row.department || row.dept || '',
          cabin: row.cabin || '',
          name: row.name || '',
          wing: row.wing || 'Other',
          floor: row.floor ?? null,
          rank: row.rank ?? 5,
        };
      });

      if (!data.length) {
        set({
          allFaculty: [],
          departments: [],
          floors: [],
          wings: [],
          isLoading: false,
          error: 'No faculty records found in Firestore collection.',
        });
        return;
      }
      
      // Derive distinct departments, floors, and wings for the filter UI
      const depts = [...new Set(data.filter(f => !!f.department).map(f => f.department))].sort();
      const flrs  = [...new Set(data.filter(f => f.floor !== null).map(f => f.floor))].sort((a, b) => a - b);
      const wngs  = [...new Set(data.filter(f => !!f.wing).map(f => f.wing))].sort();
      
      set({ 
        allFaculty: data, 
        departments: depts,
        floors: flrs,
        wings: wngs,
        isLoading: false 
      });
    } catch (err) {
      console.error('Faculty Store Error:', err);
      set({ isLoading: false, error: `Failed to load faculty data: ${err.message}` });
    }
  },

  setSearch(query) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      set({ searchQuery: query });
    }, 280);
  },

  setDeptFilter(dept) {
    set((state) => ({ activeDept: dept === state.activeDept ? null : dept }));
  },

  setFloorFilter(floor) {
    set((state) => ({ activeFloor: floor === state.activeFloor ? null : floor }));
  },

  setWingFilter(wing) {
    set((state) => ({ activeWing: wing === state.activeWing ? null : wing }));
  },

  clearFilters() {
    set({ searchQuery: '', activeDept: null, activeFloor: null, activeWing: null });
  },

  openDetail(faculty) {
    set({ selectedFaculty: faculty, isSheetOpen: true });
  },

  closeDetail() {
    set({ isSheetOpen: false });
    setTimeout(() => set({ selectedFaculty: null }), 300);
  },

  // Internal Logic
  _computeFiltered() {
    const { allFaculty, searchQuery, activeDept, activeFloor, activeWing } = get();
    const q = searchQuery.trim().toLowerCase();

    let result = allFaculty || [];

    // Search
    if (q) {
      result = result.filter(f =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.cabin || '').toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q)
      );
    }

    // Filter: Dept
    if (activeDept) {
      result = result.filter(f => f.department === activeDept);
    }

    // Filter: Floor
    if (activeFloor !== null) {
      result = result.filter(f => f.floor === activeFloor);
    }

    // Filter: Wing
    if (activeWing) {
      result = result.filter(f => f.wing === activeWing);
    }

    // Sort: PVC -> VC -> Dean -> HOD -> Faculty
    return [...result].sort((a, b) => {
      const rankA = a.rank || 5;
      const rankB = b.rank || 5;
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }
}));

export default useFacultyStore;
