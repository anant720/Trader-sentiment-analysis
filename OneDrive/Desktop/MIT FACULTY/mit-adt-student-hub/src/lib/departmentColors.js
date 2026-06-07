// ─────────────────────────────────────────────────────────
// Department → Brand Color Mapping
// Used both in faculty cards and the Firestore import script
// Hierarchy: PVC/VC get special crimson/gold treatments
// ─────────────────────────────────────────────────────────

export const DEPT_COLORS = {
  // Leadership
  'Pro Vice Chancellor':                '#B8860B', // Gold
  'Vice Chancellor':                    '#B71C1C', // Crimson
  'Dean':                               '#4E342E', // Mahogany
  'Director for international Affairs': '#1A237E', // Indigo

  // Engineering Departments
  'CSE':                                '#0056B3', // University Blue
  'CSE & IT':                           '#0277BD', // Teal Blue
  'CE':                                 '#2D6A4F', // Forest Green
  'ECE':                                '#8B1A1A', // Deep Red
  'ME':                                 '#6B4E1D', // Warm Brown
  'IT':                                 '#1A3A5C', // Navy

  // Postgrad / Commerce
  'MITCOM':                             '#4A1070', // Purple

  // Foundational
  'Applied Science & Humanities':        '#1A5276', // Steel Blue
  'Holistic Development':               '#1B5E20', // Dark Green
  'Design Thinking':                    '#E65100', // Burnt Orange
  'Aerospace':                          '#880E4F', // Magenta

  // Fallback
  default:                              '#37474F', // Slate
};

/**
 * Get the display color for a given department string.
 * Handles cleaned & uncleaned variants (e.g. "CE )" → "CE").
 */
export function getDeptColor(dept = '') {
  const cleaned = dept.replace(/\s*\)\s*$/g, '').trim();
  return DEPT_COLORS[cleaned] ?? DEPT_COLORS[dept] ?? DEPT_COLORS.default;
}

/**
 * Get a short abbreviation for filter chips.
 */
export function getDeptShort(dept = '') {
  const MAP = {
    'Applied Science & Humanities':        'AS&H',
    'Holistic Development':               'Hol Dev',
    'Design Thinking':                    'Design',
    'Director for international Affairs': 'Int. Affairs',
    'Pro Vice Chancellor':                 'PVC',
    'Vice Chancellor':                    'VC',
    'CSE & IT':                           'CSE & IT',
  };
  return MAP[dept] ?? dept;
}
