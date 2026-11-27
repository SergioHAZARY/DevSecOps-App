import type { MetadataRoute } from "next";
import { basePath, site } from "@/lib/site";

export const dynamic = "force-static";

// Generated as a static manifest.webmanifest at build time (static export).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} - ${site.slogan.fr}`,
    short_name: "DevSecOps",
    description:
      "Apprends le DevSecOps de A à Z, hors-ligne : Linux, réseaux, Python, Docker, Kubernetes, CI/CD sécurisé, OWASP, hacking éthique.",
    start_url: `${basePath}/fr/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#047857",
    lang: "fr",
    categories: ["education", "productivity", "developer"],
    icons: [
      { src: `${basePath}/icons/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${basePath}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
