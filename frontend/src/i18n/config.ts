import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["el", "en"] as const;
export const defaultLocale = "el";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
