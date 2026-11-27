"use client";

/**
 * Over-the-air update for the Android (Capacitor) app.
 *
 * On launch, if online, the app reads a small version file published to GitHub Pages
 * by the release workflow. If it names a bundle newer than the one running, it downloads
 * and stages it; it is applied on the next app start. This updates all lessons and
 * practice content without reinstalling the APK.
 *
 * On the website (not Capacitor) this does nothing - there the service worker handles updates.
 */

const VERSION_URL = "https://sergiohazary.github.io/DevSecOps-App/app-version.json";

interface VersionInfo {
  version: string;
  /** URL of the zipped web bundle (a GitHub Release asset) */
  url: string;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export async function checkForMobileUpdate(): Promise<void> {
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap?.isNativePlatform?.()) return;
  if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) return;

  try {
    const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
    await CapacitorUpdater.notifyAppReady();

    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const info = (await response.json()) as VersionInfo;
    if (!info?.version || !info?.url) return;

    const current = await CapacitorUpdater.current();
    if (current.bundle?.version === info.version) return;

    const bundle = await CapacitorUpdater.download({ url: info.url, version: info.version });
    // apply on next launch so we don't interrupt the current session
    await CapacitorUpdater.next({ id: bundle.id });
  } catch {
    // offline or update not available: keep running the bundled version
  }
}
