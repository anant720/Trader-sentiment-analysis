// ─────────────────────────────────────────────────────────
// App-wide Constants
// ─────────────────────────────────────────────────────────

export const APP_NAME = 'Arcus';
export const APP_VERSION = '1.1.0-beta';
export const APP_ID = 'com.mitadt.studenthub';

// Allowed email domains for Arcus students
export const ALLOWED_EMAIL_DOMAINS = [
  'mituniversity.edu.in',
  'mitadt.edu.in',
  'mahindrauniversity.edu.in',
  'gmail.com',
];

// Faculty hierarchy rank labels (lower number = higher rank)
export const RANK_LABELS = {
  1: 'Pro Vice Chancellor',
  2: 'Vice Chancellor',
  3: 'Dean',
  4: 'Head of Department',
  5: 'Faculty',
};

export const RANK_COLORS = {
  1: '#B8860B', // Gold
  2: '#B71C1C', // Crimson
  3: '#4E342E', // Mahogany
  4: '#0056B3', // Blue
  5: '#37474F', // Slate
};

export const RANK_ICONS = {
  1: '👑',
  2: '🏛️',
  3: '🎓',
  4: '⭐',
  5: '',
};

// Report types that students can submit
export const REPORT_TYPES = [
  { value: 'wrong_cabin',  label: 'Wrong Cabin / Room Number' },
  { value: 'wrong_dept',   label: 'Wrong Department' },
  { value: 'wrong_name',   label: 'Wrong Name / Spelling' },
  { value: 'not_found',    label: 'Faculty Not Found' },
  { value: 'other',        label: 'Other Issue' },
];

// Department short names for filter chips
export const DEPT_SHORT = {
  'Applied Science & Humanities': 'AS&H',
  'Holistic Development':         'Hol. Dev.',
  'Design Thinking':              'Design',
  'Director for international Affairs': 'Int. Affairs',
  'CSE & IT':                     'CSE & IT',
};

// Task priorities
export const TASK_PRIORITIES = [
  { value: 'high',   label: 'High',   color: '#DC2626' },
  { value: 'medium', label: 'Medium', color: '#D97706' },
  { value: 'low',    label: 'Low',    color: '#16A34A' },
];

// i18n supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi',    nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi',  nativeLabel: 'मराठी' },
];

// AdMob wait time before showing ads (ms)
export const ADMOB_DELAY_MS = 4000;

// Ad tile frequency (show 1 ad every N faculty cards)
export const AD_FREQUENCY = 5;

// Session duration: 30 days in milliseconds
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Firestore collection names
export const COLLECTIONS = {
  USERS:         'users',
  FACULTY:       'faculty',
  REPORTS:       'reports',
  TASKS:         'tasks',
  ANNOUNCEMENTS: 'announcements',
  EVENTS:        'events',
};
