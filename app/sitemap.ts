import type { MetadataRoute } from "next";
import { allCourses, modules } from "@/data/curriculum";
import { availableFor } from "@/lib/lessons";
import { locales } from "@/lib/types";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const add = (path: string, priority: number) => {
    for (const locale of locales) {
      urls.push({
        url: `${site.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`])) },
      });
    }
  };

  add("", 1);
  add("/courses", 0.9);
  add("/playground", 0.6);
  for (const module of modules) add(`/modules/${module.slug}`, 0.8);
  for (const course of allCourses) {
    add(`/courses/${course.slug}`, 0.7);
    for (const lesson of availableFor(course.slug)) add(`/courses/${course.slug}/${lesson}`, 0.6);
  }
  return urls;
}
