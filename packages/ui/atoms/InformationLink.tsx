import { useTranslations } from "@manifest-editor/i18n";
import { InfoIcon } from "../icons/InfoIcon";
import { Button } from "./Button";

export const InformationLink: React.FC<{ guidanceReference: string }> = ({ guidanceReference }) => {
  const t = useTranslations("ui");
  return (
    <Button
      as="a"
      aria-label={t("help.documentation")}
      href={guidanceReference}
      target="_blank"
      rel="noopener noreferrer"
      style={{ background: "transparent" }}
    >
      <InfoIcon aria-hidden="true" />
    </Button>
  );
};
