"use client";

import { BaseConverter } from "@/components/widgets/BaseConverter";
import { CidrCalculator } from "@/components/widgets/CidrCalculator";
import { PermissionCalculator } from "@/components/widgets/PermissionCalculator";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

interface WidgetRendererProps {
  name: string;
  widgets: Dictionary["widgets"];
  locale: Locale;
}

/** Renders the interactive tool a lesson asked for, by name. */
export function WidgetRenderer({ name, widgets, locale }: WidgetRendererProps) {
  switch (name) {
    case "cidr-calculator":
      return <CidrCalculator t={widgets.cidr} locale={locale} />;
    case "base-converter":
      return <BaseConverter t={widgets.base} />;
    case "permission-calculator":
      return <PermissionCalculator t={widgets.perm} />;
    default:
      return null;
  }
}
