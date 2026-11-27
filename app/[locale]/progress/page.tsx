import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgressDashboard, type DashboardModule } from "@/components/ProgressDashboard";
import { modules } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { isValidLocale, localeParams } from "@/lib/lessons";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return localeParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  return {
    title: dict.progress.title,
    description: dict.meta.progressDescription,
    alternates: { canonical: localePath(locale as Locale, "/progress") },
    robots: { index: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const dashboardModules: DashboardModule[] = modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title[locale],
    lessonKeys: m.courses.flatMap((c) => c.lessons.map((l) => `${c.slug}/${l.slug}`)),
  }));

  return (
    <ProgressDashboard
      locale={locale}
      modules={dashboardModules}
      dict={{ progress: dict.progress, certificate: dict.certificate, course: dict.course }}
      slogan={site.slogan[locale]}
    />
  );
}
