import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("common.nav");

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-semibold" href="/">
          Beautivo
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/services">{t("services")}</Link>
          <Link href="/booking">{t("booking")}</Link>
          <Link href="/account">{t("account")}</Link>
          <Link href="/admin">{t("admin")}</Link>
        </nav>
      </div>
    </header>
  );
}
