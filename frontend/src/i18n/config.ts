import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["el", "en"] as const;
export const defaultLocale = "el";

export default getRequestConfig(async ({ locale }) => {
  if (locale && !locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const resolvedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`./locales/${resolvedLocale}.json`)).default,
  };
});
