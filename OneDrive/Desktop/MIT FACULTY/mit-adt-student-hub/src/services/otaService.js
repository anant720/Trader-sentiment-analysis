import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import env from '../config/env';

class OtaService {
  constructor() {
    this.currentVersion = localStorage.getItem('app_version') || '1.1.0';
    this.isNative = Capacitor.isNativePlatform();
  }

  async checkForUpdates() {
    if (!this.isNative) {
      console.log('OTA Updates only run on Native iOS/Android.');
      return null;
    }

    try {
      // 1. Fetch latest version from Vercel deployment
      const response = await fetch(`https://arcus-8r5m.vercel.app/ota.json?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }

      const data = await response.json();
      const { version, url } = data;

      // 2. Check if the backend version is newer than current
      if (version && version !== this.currentVersion) {
        console.log(`New OTA update found! Current: ${this.currentVersion}, New: ${version}`);
        
        // Return update metadata
        return {
          version,
          url: url
        };
      }

      console.log('App is up to date.');
      return null;
    } catch (error) {
      console.error('OTA Check error:', error);
      return null;
    }
  }

  async downloadAndInstall(updateInfo, onProgress) {
    if (!this.isNative) return false;

    try {
      // Notify Capacitor Updater
      await CapacitorUpdater.notifyAppReady();

      // Download the ZIP
      const bundle = await CapacitorUpdater.download({
        url: updateInfo.url,
        version: updateInfo.version,
      });

      // Install it
      await CapacitorUpdater.set({ id: bundle.id });

      // Save new version to local storage
      localStorage.setItem('app_version', updateInfo.version);
      
      return true;
    } catch (error) {
      console.error('OTA Install error:', error);
      return false;
    }
  }
}

const otaService = new OtaService();
export default otaService;
