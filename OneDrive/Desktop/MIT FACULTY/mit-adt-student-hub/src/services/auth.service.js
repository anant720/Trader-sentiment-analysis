import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_EMAIL_DOMAINS } from '../config/constants';
import { apiRequest, setAccessToken } from '../config/api';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

function getDomain(email = '') {
  return email.split('@')[1]?.toLowerCase?.() ?? '';
}

export function isAllowedUniversityEmail(email = '') {
  if (!ALLOWED_EMAIL_DOMAINS?.length) return true;
  return ALLOWED_EMAIL_DOMAINS.includes(getDomain(email));
}

export async function signInWithGoogle() {
  let user;

  if (Capacitor.isNativePlatform()) {
    GoogleAuth.initialize();
    const nativeResult = await GoogleAuth.signIn();
    const credential = GoogleAuthProvider.credential(nativeResult.authentication.idToken);
    const result = await signInWithCredential(auth, credential);
    user = result.user;
  } else {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  }

  if (!isAllowedUniversityEmail(user.email)) {
    await firebaseSignOut(auth);
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut().catch(() => {});
    }
    const error = new Error('Please use your official university Google account.');
    error.code = 'auth/unauthorized-domain';
    throw error;
  }

  const idToken = await user.getIdToken();
  const backendRes = await apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  setAccessToken(backendRes.accessToken);
  return { user, profile: backendRes.user };
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile() {
  const res = await apiRequest('/auth/me');
  return res.user;
}

export async function completeUserProfile(payload) {
  const updateData = {
    displayName: payload.displayName,
    department: payload.department,
    course: payload.course,
    year: Number(payload.year),
    enrollment: payload.enrollment,
    roll: payload.roll,
    isComplete: true,
  };
  const res = await apiRequest('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return res.data;
}

export async function signOut() {
  await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  setAccessToken(null);
  await firebaseSignOut(auth).catch(() => {});
  if (Capacitor.isNativePlatform()) {
    await GoogleAuth.signOut().catch(() => {});
  }
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function signUpWithEmail({ email, password, displayName }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    const actionCodeSettings = {
      url: 'https://arcus-8r5m.vercel.app/login?verified=true', 
      handleCodeInApp: true,
      android: {
        packageName: 'com.arcus.campusapp',
        installApp: true,
        minimumVersion: '12'
      }
    };
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    return userCredential.user;
  } catch (error) {
    let friendlyMessage = 'Failed to create account.';
    if (error.code === 'auth/email-already-in-use') {
      friendlyMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      friendlyMessage = 'Password should be at least 6 characters.';
    }
    const enhancedError = new Error(friendlyMessage);
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

export async function signInWithEmail({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential.user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error('Please verify your email address before logging in. Check your inbox.');
    }

    const idToken = await userCredential.user.getIdToken();
    const backendRes = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    setAccessToken(backendRes.accessToken);
    return { user: userCredential.user, profile: backendRes.user };
  } catch (error) {
    let friendlyMessage = 'Failed to sign in.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        friendlyMessage = 'Incorrect email or password.';
        break;
      case 'auth/too-many-requests':
        friendlyMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        friendlyMessage = 'This account has been disabled.';
        break;
      default:
        friendlyMessage = error.message || friendlyMessage;
    }
    const enhancedError = new Error(friendlyMessage);
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

export async function refreshSession() {
  const res = await apiRequest('/auth/refresh', { method: 'POST' });
  if (res.accessToken) setAccessToken(res.accessToken);
  return res;
}

export async function setHardPassword(password) {
  return apiRequest('/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
