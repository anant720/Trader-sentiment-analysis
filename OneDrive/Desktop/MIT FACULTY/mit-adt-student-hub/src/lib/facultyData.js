// ─────────────────────────────────────────────────────────
// Faculty Data — Parsed from faculty_data.csv
//
// HIERARCHY (role title determines rank — ⭐ in CSV is IGNORED):
//   Rank 1 → Pro Vice Chancellor  (highest)
//   Rank 2 → Vice Chancellor
//   Rank 3 → Dean
//   Rank 4 → Head of Department (HOD)
//   Rank 5 → Regular Faculty
// ─────────────────────────────────────────────────────────

import csvRaw from '../data/faculty_data.csv?raw';
import { getDeptColor } from './departmentColors';

// ── Rank detection helpers ──────────────────────────────
function detectRank(name, dept) {
  const n = name.toLowerCase();
  const d = (dept || '').toLowerCase();

  if (d.includes('pro vice chancellor') || n.includes('pro vice chancellor'))
    return { rank: 1, isPVC: true,  isVC: false, isDean: false, isHOD: false };
  if (d.includes('vice chancellor') || n.includes('vice chancellor'))
    return { rank: 2, isPVC: false, isVC: true,  isDean: false, isHOD: false };
  if (d === 'dean' || n.includes('(dean)') || n.includes('dean'))
    return { rank: 3, isPVC: false, isVC: false, isDean: true,  isHOD: false };
  if (n.includes('(hod)') || n.includes('hod)') || n.includes('mca head') || n.includes('pcm/mtech'))
    return { rank: 4, isPVC: false, isVC: false, isDean: false, isHOD: true  };
  return   { rank: 5, isPVC: false, isVC: false, isDean: false, isHOD: false };
}

// Clean dept string: "CE )" → "CE"
function cleanDept(dept) {
  return dept.replace(/\s*\)\s*$/, '').trim();
}

// Clean name: remove leading ⭐/⭐️ and "(HOD)" etc.
function cleanName(raw) {
  return raw.replace(/^[⭐★\s]+/, '').trim();
}

// Parse CSV text into structured faculty objects
function parseFacultyCSV(raw) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const seen = new Set();
  const result = [];
  let id = 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields (commas inside "...")
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { parts.push(current); current = ''; continue; }
      current += char;
    }
    parts.push(current);

    if (parts.length < 3) continue;

    const rawName = parts[0].trim();
    const rawDept = parts[1].trim();
    const cabin   = parts[2].trim();
    const free    = parts[3]?.trim() || '12:40 – 1:40 PM, after 3:30 PM';

    if (!rawName || !rawDept) continue;

    // ⭐ star in CSV has NO special meaning — strip it from display name only
    const name     = cleanName(rawName);
    const dept     = cleanDept(rawDept);

    // De-duplicate
    const key = `${name.toLowerCase()}|${cabin.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hierarchy = detectRank(rawName, dept);

    // Parse floor from cabin (first letter = N/S, first digit = floor)
    const cabinUpper = cabin.toUpperCase();
    const floorMatch = cabinUpper.match(/[NS]?(\d)/);
    const floor      = floorMatch ? parseInt(floorMatch[1]) : null;
    const wing       = cabinUpper.startsWith('S') ? 'South' : cabinUpper.startsWith('N') ? 'North' : 'Other';

    result.push({
      id: String(id++),
      name,
      dept,
      cabin,
      freeTimings: free,
      departmentColor: getDeptColor(dept),
      floor,
      wing,
      reportCount: 0,
      ...hierarchy,
    });
  }

  // Sort: rank ASC, then name A-Z within same rank
  result.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name);
  });

  return result;
}

// Parse once at module load
export const FACULTY_DATA = parseFacultyCSV(csvRaw);

// Get all unique departments (sorted)
export const DEPARTMENTS = [...new Set(FACULTY_DATA.map(f => f.dept))].sort();

// Get unique floors (sorted)
export const FLOORS = [...new Set(FACULTY_DATA.map(f => f.floor).filter(Boolean))].sort((a,b) => a-b);

export default FACULTY_DATA;
