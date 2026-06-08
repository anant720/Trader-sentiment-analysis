import { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Native plugin reference
const ApkInstaller = registerPlugin('ApkInstaller');

// Update this to wherever you decide to host version.json
const VERSION_URL = 'https://raw.githubusercontent.com/anant720/arcus/master/landing/version.json';

// Current App Version (Hardcoded)
const APP_VERSION = '1.0.1';

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState({
    updateAvailable: false,
    latestVersion: APP_VERSION,
    apkUrl: '',
    forceUpdate: false,
  });
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const response = await fetch(VERSION_URL + '?t=' + new Date().getTime(), { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch update config');
        
        const data = await response.json();
        const latest = data.latestVersion;
        
        // Simple string comparison for versions (assumes strict semver like 1.0.1 > 1.0.0)
        const isNewer = latest.localeCompare(APP_VERSION, undefined, { numeric: true, sensitivity: 'base' }) > 0;

        if (isNewer) {
          setUpdateInfo({
            updateAvailable: true,
            latestVersion: latest,
            apkUrl: data.apkUrl,
            forceUpdate: data.forceUpdate || false,
          });
        }
      } catch (err) {
        console.error('Update check failed:', err);
      } finally {
        setIsChecking(false);
      }
    }

    if (Capacitor.getPlatform() === 'android') {
      checkForUpdates();
    } else {
      setIsChecking(false);
    }
  }, []);

  const downloadAndInstall = async () => {
    if (!updateInfo.apkUrl) return;

    try {
      setIsDownloading(true);
      setError(null);

      const fileName = `arcus-update-v${updateInfo.latestVersion}.apk`;

      let progressListener;
      try {
        progressListener = await Filesystem.addListener('progress', (progress) => {
          const percent = Math.round((progress.bytes / progress.contentLength) * 100);
          setDownloadProgress(percent);
        });
      } catch (e) {
        // Fallback if plugin doesn't support progress events on this platform
      }

      const downloadResult = await Filesystem.downloadFile({
        url: updateInfo.apkUrl,
        path: fileName,
        directory: Directory.Cache,
        progress: true
      });

      if (progressListener) {
        await progressListener.remove();
      }

      await ApkInstaller.install({ path: downloadResult.path });
      
    } catch (err) {
      console.error('Download/Install Error:', err);
      setError(err.message || 'Failed to download or install the update.');
    } finally {
      setIsDownloading(false);
    }
  };

  return { ...updateInfo, isChecking, isDownloading, downloadProgress, error, downloadAndInstall, APP_VERSION };
}
