import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Android app configuration.
 *
 * The whole exported site (`out/`) is bundled into the APK, so every lesson and
 * every practice page works 100% offline from the moment the app is installed -
 * essential for studying during power and internet cuts.
 *
 * Over-the-air updates: @capgo/capacitor-updater lets the app download a new web
 * bundle (published by the CI release job) and apply it on the next launch, so the
 * content updates itself without reinstalling the APK. See lib/mobile-update.ts.
 *
 * The Android build must be produced with NEXT_PUBLIC_BASE_PATH empty, so that
 * assets resolve from the local root inside the WebView.
 */
const config: CapacitorConfig = {
  appId: "com.sergiohazary.devsecops",
  appName: "DevSecOps App",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    CapacitorUpdater: {
      // we drive updates ourselves from a static version file on GitHub Pages
      autoUpdate: false,
      resetWhenUpdate: true,
      directUpdate: false,
    },
  },
};

export default config;
