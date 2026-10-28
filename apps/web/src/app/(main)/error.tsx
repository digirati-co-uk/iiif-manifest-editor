"use client";
import { useTranslations } from "@manifest-editor/i18n";
import { HeaderLanguageSwitcher } from "../../components/site/HeaderLanguageSwitcher";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("web");
  return (
    <main className="p-6">
      <HeaderLanguageSwitcher />
      <p role="alert">{t("route.failed")}</p>
      <button onClick={reset}>{t("route.retry")}</button>
    </main>
  );
}
