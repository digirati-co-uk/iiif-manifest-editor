import { useTranslations } from "@manifest-editor/i18n";
import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { Button } from "./Button";

type AdditionalProperty = {
  label: string;
  addAnother: () => void;
};

export const AdditionalProperty: React.FC<AdditionalProperty> = ({ label, addAnother }) => {
  const t = useTranslations("ui");
  return (
    <FlexContainer style={{ justifyContent: "space-between" }}>
      {label}
      <Button aria-label={t("property.add", { label })} title={t("property.add", { label })} onClick={addAnother}>
        <AddIcon />
      </Button>
    </FlexContainer>
  );
};
