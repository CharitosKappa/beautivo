import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: "always",
});

export default intlMiddleware;

export const config = {
  matcher: ["/((?!_next|.*\..*).*)"],
};
