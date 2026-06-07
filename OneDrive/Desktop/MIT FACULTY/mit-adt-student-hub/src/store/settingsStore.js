// ─────────────────────────────────────────────────────────
// Settings Store (Zustand) — Language, Theme, Notifications
// Persisted to Capacitor Preferences + Firestore /users/{uid}
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import i18n from '../i18n';

const PREF_KEY = 'mit_hub_settings';

const useSettingsStore = create((set, get) => ({
  language:      'en',
  theme:         'light',
  notifications: true,

  // Load from localStorage (web) / Preferences (native)
  async load() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          language:      saved.language      ?? 'en',
          theme:         saved.theme         ?? 'light',
          notifications: saved.notifications ?? true,
        });
        i18n.changeLanguage(saved.language ?? 'en');
        applyTheme(saved.theme ?? 'light');
      }
    } catch (_) {}
  },

  _persist(patch) {
    const next = { ...get(), ...patch };
    localStorage.setItem(PREF_KEY, JSON.stringify({
      language:      next.language,
      theme:         next.theme,
      notifications: next.notifications,
    }));
  },

  async setLanguage(lang, uid) {
    set({ language: lang });
    get()._persist({ language: lang });
    i18n.changeLanguage(lang);
    if (uid) {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { language: lang }).catch(() => {});
    }
  },

  async setTheme(theme, uid) {
    set({ theme });
    get()._persist({ theme });
    applyTheme(theme);
    if (uid) {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { theme }).catch(() => {});
    }
  },

  async setNotifications(val) {
    set({ notifications: val });
    get()._persist({ notifications: val });
  },
}));

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default useSettingsStore;
