"use client";

import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <div className="text-xs uppercase tracking-wide text-muted-foreground">
      Locale: {locale}
    </div>
  );
}
