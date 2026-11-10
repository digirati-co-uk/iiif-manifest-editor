import { useTranslations } from "@manifest-editor/i18n";
import { Button } from "react-aria-components";
import { MoreMenuIcon } from "./icons/MoreMenu";

export function MoreMenuButton() {
  const t = useTranslations("components");
  return (
    <Button
      aria-label={t("actions.more")}
      className="rounded-full bg-gray-200 text-gray-500 hover:bg-me-600 hover:text-white data-[pressed]:bg-me-600 data-[pressed]:text-white"
    >
      <MoreMenuIcon aria-hidden="true" className="text-xl" />
    </Button>
  );
}
