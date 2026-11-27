import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaygroundPage } from "@/components/PlaygroundPage";
import { getDictionary, localePath } from "@/lib/i18n";
import { isValidLocale, localeParams } from "@/lib/lessons";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return localeParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  return {
    title: dict.meta.playgroundTitle,
    description: dict.meta.playgroundDescription,
    alternates: { canonical: localePath(locale as Locale, "/playground") },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return <PlaygroundPage t={dict.code} title={dict.nav.playground} subtitle={dict.meta.playgroundDescription} />;
}
