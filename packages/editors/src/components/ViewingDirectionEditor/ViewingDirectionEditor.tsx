import { useTranslations } from "@manifest-editor/i18n";
import { TechnicalProperties } from "@iiif/presentation-3";
import { useResource } from "@manifest-editor/shell";
import { useVault } from "react-iiif-vault";
import { InputContainer, InputLabel } from "../Input";
import { InlineSelect } from "../../form-elements/InlineSelect/InlineSelect";

export function ViewingDirectionEditor({ id, name }: { id?: string; name?: string }) {
  const t = useTranslations("editors");
  const resource = useResource<Partial<{ viewingDirection: TechnicalProperties["viewingDirection"] }>>();
  const vault = useVault();
  const value = resource.viewingDirection || "left-to-right";

  const setValue = (newValue: string) => {
    vault.modifyEntityField(resource, "viewingDirection", newValue);
  };

  return (
    <InputContainer $fluid>
      <InputLabel htmlFor="my-thing2">{t("ui.viewingDirection")}</InputLabel>
      <InlineSelect
        id={id}
        name={name}
        value={value}
        onChange={setValue}
        options={[
          {
            label: { en: [t("ui.leftToRight")] },
            value: "left-to-right",
          },
          {
            label: { en: [t("ui.rightToLeft")] },
            value: "right-to-left",
          },
          {
            label: { en: [t("ui.topToBottom")] },
            value: "top-to-bottom",
          },
          {
            label: { en: [t("ui.bottomToTop")] },
            value: "bottom-to-top",
          },
        ]}
      />
    </InputContainer>
  );
}
