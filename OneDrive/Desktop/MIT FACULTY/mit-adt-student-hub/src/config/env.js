const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function readEnv(key, { required = false } = {}) {
  const value = import.meta.env[key];

  if (required && (!value || String(value).trim() === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value?.trim?.() ?? value ?? '';
}

for (const key of REQUIRED_ENV_KEYS) {
  readEnv(key, { required: true });
}

export const env = {
  firebaseApiKey: readEnv('VITE_FIREBASE_API_KEY', { required: true }),
  firebaseAuthDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN', { required: true }),
  firebaseProjectId: readEnv('VITE_FIREBASE_PROJECT_ID', { required: true }),
  firebaseStorageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET', { required: true }),
  firebaseMessagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', { required: true }),
  firebaseAppId: readEnv('VITE_FIREBASE_APP_ID', { required: true }),
  firebaseMeasurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID'),
  appCheckDebugToken: readEnv('VITE_APP_CHECK_DEBUG_TOKEN'),
};

export default env;
