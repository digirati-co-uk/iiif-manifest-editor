// A separate consumer module resolves the package's public source export.
import { useTranslations } from "@manifest-editor/i18n";
export function Plugin() {
  const t = useTranslations("demo");
  return <output>{t("title")}</output>;
}
