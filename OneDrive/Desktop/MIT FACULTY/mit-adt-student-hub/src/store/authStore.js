// ─────────────────────────────────────────────────────────
// Auth Store (Zustand)
// Manages: user session, 30-day persistence, admin flag
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import {
  getUserProfile,
  signInWithGoogle as signInWithGoogleService,
  subscribeToAuthState,
  completeUserProfile,
  signOut as signOutService,
  resetPassword as resetPasswordService,
  signUpWithEmail as signUpWithEmailService,
  signInWithEmail,
  setHardPassword as setHardPasswordService,
} from '../services/auth.service';
import { apiRequest, setAccessToken } from '../config/api';

function getLocalSession() {
  try {
    const token = localStorage.getItem('mit_hub_access_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is structurally valid
    if (!payload.uid || !payload.exp) return null;
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('mit_hub_access_token');
      return null;
    }

    return { 
      user: { uid: payload.uid, email: payload.email },
      isAdmin: payload.role === 'admin'
    };
  } catch (e) {
    return null;
  }
}

const localSession = getLocalSession();

const useAuthStore = create((set, get) => ({
  user: localSession ? localSession.user : null,
  profile: null,       // Firestore /users/{uid} document
  isLoading: true,     // True until first auth state check resolves
  needsProfile: false, // True if user is logged in but hasn't completed profile
  needsPassword: false, // True if user signed in via Google but hasn't set a hard password
  isAdmin: localSession ? localSession.isAdmin : false,
  error: null,
  isAuthenticating: false,

  // ── Initialize auth listener (call once in App.jsx) ──
  init() {
    set({ isLoading: true, error: null });

    const hydrateFromBackend = async (fallbackUser = null) => {
      try {
        let profile;
        try {
          profile = await getUserProfile();
        } catch (err) {
          // If backend profile fetch fails but we have a firebaseUser, our backend session is missing/expired.
          // Self-heal by getting a new backend token using the Firebase ID Token!
          if (fallbackUser) {
            const idToken = await fallbackUser.getIdToken();
            const backendRes = await apiRequest('/auth/google', {
              method: 'POST',
              body: JSON.stringify({ idToken }),
            });
            setAccessToken(backendRes.accessToken);
            profile = backendRes.user;
          } else {
            throw err;
          }
        }

        const isComplete = !!(
          profile?.displayName &&
          profile?.department &&
          profile?.course &&
          profile?.year &&
          profile?.enrollment &&
          profile?.roll
        );
        set({
          user: fallbackUser || { uid: profile?.uid, email: profile?.email },
          profile,
          needsProfile: !isComplete,
          needsPassword: profile?.needsPassword === true,
          isAdmin: profile?.role === 'admin' || profile?.isAdmin === true,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (e) {
        console.error('hydrateFromBackend failed:', e);
        return false;
      }
    };

    const unsub = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        if (get().isAuthenticating) return; // Prevent race condition during login
        const ok = await hydrateFromBackend(firebaseUser);
        if (!ok) {
          set({ isLoading: false, error: 'Unable to load profile from backend.', user: null });
        }
        return;
      }

      // For email+OTP auth there is no Firebase client user; rely on backend session.
      const ok = await hydrateFromBackend();
      if (!ok) {
        // If we already had a local session, don't wipe it out on a simple network failure
        const hasSession = !!getLocalSession();
        if (!hasSession) {
          set({ user: null, profile: null, needsProfile: false, needsPassword: false, isAdmin: false, isLoading: false });
        } else {
          set({ isLoading: false }); // keep user logged in with stale data
        }
      }
    });

    // Precision fallback: If after 8 seconds nothing happens, stop loading
    setTimeout(() => {
      if (get().isLoading) {
        set({ isLoading: false, error: "Auth connection timed out. Check network." });
      }
    }, 8000);

    return unsub;
  },

  // ── Google Sign In (Production Only) ──────────────────
  async signInWithGoogle() {
    set({ isLoading: true, error: null, isAuthenticating: true });
    try {
      const { user, profile } = await signInWithGoogleService();
      const isComplete = !!(
        profile?.displayName &&
        profile?.department &&
        profile?.course &&
        profile?.year &&
        profile?.enrollment &&
        profile?.roll
      );

      set({
        user,
        profile,
        needsProfile: !isComplete,
        needsPassword: profile?.needsPassword === true,
        isAdmin: profile?.role === 'admin' || profile?.isAdmin === true,
        isLoading: false,
        isAuthenticating: false,
        error: null,
      });
      return { success: true };
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        set({ isLoading: false, isAuthenticating: false, error: null });
        return { success: false };
      }
      const msg = err?.message || mapAuthError(err.code);
      set({ isLoading: false, isAuthenticating: false, error: msg });
      return { success: false, error: msg };
    }
  },

  async signUpWithEmail({ email, password, displayName }) {
    set({ isLoading: true, error: null, isAuthenticating: true });
    try {
      await signUpWithEmailService({ email, password });
      set({ isLoading: false, isAuthenticating: false });
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Failed to create account';
      set({ isLoading: false, isAuthenticating: false, error: msg });
      return { success: false, error: msg };
    }
  },

  async loginWithEmail({ email, password }) {
    set({ isLoading: true, error: null, isAuthenticating: true });
    try {
      const res = await signInWithEmail({ email, password });
      const profile = res.profile || null;
      const isComplete = !!(
        profile?.displayName &&
        profile?.department &&
        profile?.course &&
        profile?.year &&
        profile?.enrollment &&
        profile?.roll
      );
      set({
        user: { uid: profile?.uid, email: profile?.email },
        profile,
        needsProfile: !isComplete,
        isAdmin: profile?.role === 'admin' || profile?.isAdmin === true,
        isLoading: false,
        isAuthenticating: false,
      });
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Login failed';
      set({ isLoading: false, isAuthenticating: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // ── Complete Profile (Precision Step) ───────────────
  async completeProfile({ displayName, department, course, year, enrollment, roll }) {
    const { user } = get();
    if (!user) return { success: false, error: 'No user session' };

    set({ isLoading: true });
    try {
      const updateData = await completeUserProfile({
        displayName,
        department,
        course,
        year,
        enrollment,
        roll,
      });
      
      // Update local state
      set((state) => ({
        profile: { ...state.profile, ...updateData },
        needsProfile: false,
        isLoading: false
      }));

      return { success: true };
    } catch (err) {
      console.error(err);
      set({ isLoading: false, error: 'Failed to save profile' });
      return { success: false, error: 'Failed to save profile' };
    }
  },

  // ── Set Hard Password ───────────────────────────────
  async setHardPassword(password) {
    set({ isLoading: true, error: null });
    try {
      await setHardPasswordService(password);
      set({ needsPassword: false, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Failed to set password' });
      return { success: false, error: err.message };
    }
  },

  // ── Sign Out ────────────────────────────────────────
  async signOut() {
    await signOutService();
    set({ user: null, profile: null, isAdmin: false, needsProfile: false, needsPassword: false });
  },

  // ── Reset Password ──────────────────────────────────
  async resetPassword(email) {
    try {
      await resetPasswordService(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: mapAuthError(err.code) };
    }
  },

  clearError() { set({ error: null }); },
}));

// ── Firebase error code → human message ──────────────────
function mapAuthError(code) {
  const MAP = {
    'auth/email-already-in-use':    'This email is already registered.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Invalid email or password.',
    'auth/too-many-requests':       'Too many attempts. Please try again later.',
    'auth/network-request-failed':  'Network error. Check your connection.',
    'auth/unauthorized-domain':     'Please sign in with your official university Google account.',
  };
  return MAP[code] ?? 'Something went wrong. Please try again.';
}

export default useAuthStore;
