import type { NextConfig } from "next";

/**
 * Static export: the whole site is pre-rendered to plain HTML/JS/CSS in `out/`.
 * This is what makes it work on GitHub Pages, fully offline (PWA), and bundled
 * inside the Android app. No Node server is needed at runtime.
 *
 * - NEXT_PUBLIC_BASE_PATH is "/DevSecOps-App" for the GitHub Pages project site,
 *   and empty for local dev and the Android (Capacitor) build.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  // Security headers can't be served by GitHub Pages; they are set by the host
  // (Android WebView config + a CSP <meta> in the root layout) instead.
};

export default nextConfig;
