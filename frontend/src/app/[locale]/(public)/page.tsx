import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("public");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{t("homeTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("homeSubtitle")}</p>
    </main>
  );
}
