"use client";

import { useTranslations } from "@manifest-editor/i18n";
import { ManifestEditorLogo } from "@manifest-editor/components";
import Link from "next/link";

export function SiteLogoLink() {
  const t = useTranslations("web");
  return (
    <Link href="/" aria-label={t("navigation.home")} className="flex min-w-0 flex-none justify-start">
      <ManifestEditorLogo aria-hidden="true" className="me-logo h-auto w-[clamp(8rem,13.75vw,11rem)]" />
    </Link>
  );
}
