"use client";
import { useTranslations } from "@manifest-editor/i18n";

export function GlobalNav() {
  const t = useTranslations("web");
  return (
    <ul className="flex gap-4">
      <li>
        <a
          href="https://github.com/digirati-co-uk/iiif-manifest-editor"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-2 md:px-4 rounded whitespace-nowrap"
        >
          {t("navigation.github")}
        </a>
      </li>
      <li>
        <a
          href="https://manifest-editor-docs.netlify.app"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-2 md:px-4 rounded whitespace-nowrap"
        >
          {t("navigation.documentation")}
        </a>
      </li>
    </ul>
  );
}
