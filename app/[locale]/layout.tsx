import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDictionary, localePath } from "@/lib/i18n";
import { isValidLocale, localeParams } from "@/lib/lessons";

export function generateStaticParams() {
  return localeParams();
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href={`${localePath(locale)}#main`}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {dict.skipToContent}
      </a>
      <Header locale={locale} />
      <div className="flex flex-1 flex-col pt-[var(--header-height)]">{children}</div>
      <Footer locale={locale} />
    </div>
  );
}
