import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arcus.campusapp',
  appName: 'Arcus',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },

  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '486841171883-rc6b8m829p38qknuvad43talfcmhl77h.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      backgroundColor: '#F2F2F7',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    CapacitorUpdater: {
      autoUpdate: false,
    },
  },
};

export default config;
