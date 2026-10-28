"use client";
import Link from "next/link";
import { useTranslations } from "@manifest-editor/i18n";
import { HeaderLanguageMenu } from "../../components/site/HeaderLanguageMenu";
export default function NotFound() {
  const t = useTranslations("web");
  return (
    <main className="p-6">
      <HeaderLanguageMenu />
      <h1>{t("route.notFoundTitle")}</h1>
      <p>{t("route.notFound")}</p>
      <Link href="/">{t("route.home")}</Link>
    </main>
  );
}
