import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_EMAIL_DOMAINS } from '../config/constants';
import { apiRequest, setAccessToken } from '../config/api';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
    const nativeResult = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(nativeResult.credential?.idToken);
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
      await FirebaseAuthentication.signOut().catch(() => {});
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
    await FirebaseAuthentication.signOut().catch(() => {});
  }
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function requestEmailSignupOtp({ email, password, displayName }) {
  return apiRequest('/auth/email/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function verifyEmailSignupOtp({ email, otp }) {
  const res = await apiRequest('/auth/email/verify-signup', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  setAccessToken(res.accessToken);
  return res;
}

export async function signInWithEmail({ email, password }) {
  const res = await apiRequest('/auth/email/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(res.accessToken);
  return res;
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
