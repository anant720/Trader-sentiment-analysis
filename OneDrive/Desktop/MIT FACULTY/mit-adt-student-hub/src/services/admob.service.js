/**
 * admob.service.js
 * Centralized AdMob initialization and ad display logic.
 * Works on Android (Capacitor). Gracefully falls back to no-op on web.
 *
 * Ad Unit IDs below are TEST IDs for development.
 * Replace with your REAL AdMob IDs before publishing to Play Store.
 *
 * TEST App ID     : ca-app-pub-3940256099942544~3347511713
 * TEST Banner     : ca-app-pub-3940256099942544/6300978111
 * TEST Interstitial: ca-app-pub-3940256099942544/1033173712
 * TEST Native     : ca-app-pub-3940256099942544/2247696110
 *
 * YOUR REAL IDs: Update these once you create your AdMob account at
 * https://admob.google.com and create an Android app there.
 */

import { Capacitor } from '@capacitor/core';

// ── Replace these with your REAL AdMob IDs before going live ──
const AD_UNITS = {
  // Test IDs (safe to use during development only)
  banner:        'ca-app-pub-3940256099942544/6300978111',
  interstitial:  'ca-app-pub-3940256099942544/1033173712',
};

// ── Real IDs (swap these in when you publish) ──
// const AD_UNITS = {
//   banner:       'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',   // your real banner ID
//   interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',   // your real interstitial ID
// };

let AdMob = null;
let initialized = false;
let interstitialReady = false;

/**
 * Must be called once on app startup (in main.jsx or App.jsx useEffect).
 * Safe to call on web — will silently do nothing.
 */
export async function initAdMob() {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;

  try {
    const mod = await import('@capacitor-community/admob');
    AdMob = mod.AdMob;

    await AdMob.initialize({
      // Set to true to only show ads to users who have consented (EU GDPR)
      initializeForTesting: false,
      testingDevices: [],
    });

    initialized = true;
    console.log('[AdMob] Initialized successfully');

    // Pre-load the first interstitial immediately so it is ready
    await preloadInterstitial();
  } catch (err) {
    console.warn('[AdMob] Init failed (safe to ignore on web):', err.message);
  }
}

/**
 * Show a Banner ad at the bottom of the screen.
 * Call this after faculty data has loaded (with optional delay).
 */
export async function showBannerAd() {
  if (!AdMob || !initialized) return;
  try {
    const { BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,  // set true if using test ad IDs
    });
  } catch (err) {
    console.warn('[AdMob] Banner failed:', err.message);
  }
}

export async function hideBannerAd() {
  if (!AdMob || !initialized) return;
  try {
    await AdMob.hideBanner();
  } catch (_) {}
}

export async function removeBannerAd() {
  if (!AdMob || !initialized) return;
  try {
    await AdMob.removeBanner();
  } catch (_) {}
}

/**
 * Preload an interstitial ad so it shows instantly when triggered.
 */
export async function preloadInterstitial() {
  if (!AdMob || !initialized) return;
  try {
    await AdMob.prepareInterstitial({ adId: AD_UNITS.interstitial });
    interstitialReady = true;
  } catch (err) {
    console.warn('[AdMob] Interstitial preload failed:', err.message);
    interstitialReady = false;
  }
}

/**
 * Show an interstitial ad if one is ready.
 * After showing, preloads the next one automatically.
 * Use this sparingly — max once per major navigation action.
 */
export async function showInterstitialAd() {
  if (!AdMob || !initialized || !interstitialReady) return;
  try {
    interstitialReady = false;
    await AdMob.showInterstitial();
    // Pre-load next one after a short delay
    setTimeout(preloadInterstitial, 2000);
  } catch (err) {
    console.warn('[AdMob] Interstitial show failed:', err.message);
    setTimeout(preloadInterstitial, 2000);
  }
}
