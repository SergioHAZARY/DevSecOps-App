/**
 * Base path the app is served from. Empty for local dev and the Android bundle,
 * "/DevSecOps-App" for a GitHub Pages project site. Injected at build time.
 */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export const site = {
  name: "DevSecOps App",
  slogan: {
    fr: "Apprends, Pratique, Sécurise",
    en: "Learn, Practice, Secure",
  },
  repo: "https://github.com/SergioHAZARY/DevSecOps-App",
  /** Public URL, without trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;

/** Prefixes a public asset / fetch path with the base path (next/link does this on its own). */
export function asset(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
