import { InputContainer, InputLabel } from "@/editors/Input";
import { InlineSelect } from "@/_components/form-elements/InlineSelect/InlineSelect";
import { useResource } from "@/shell/ResourceEditingContext/ResourceEditingContext";
import { TechnicalProperties } from "@iiif/presentation-3";
import { useVault } from "react-iiif-vault";

export function ViewingDirectionEditor({ id, name }: { id?: string; name?: string }) {
  const resource = useResource<Partial<{ viewingDirection: TechnicalProperties["viewingDirection"] }>>();
  const vault = useVault();
  const value = resource.viewingDirection || "left-to-right";

  const setValue = (newValue: string) => {
    vault.modifyEntityField(resource, "viewingDirection", newValue);
  };

  return (
    <InputContainer fluid>
      <InputLabel htmlFor="my-thing2">Viewing direction</InputLabel>
      <InlineSelect
        id={id}
        name={name}
        value={value}
        onChange={setValue}
        options={[
          {
            label: { en: ["Left to right"] },
            value: "left-to-right",
          },
          {
            label: { en: ["Right to left"] },
            value: "right-to-left",
          },
          {
            label: { en: ["Top to bottom"] },
            value: "top-to-bottom",
          },
          {
            label: { en: ["Bottom to top"] },
            value: "bottom-to-top",
          },
        ]}
      />
    </InputContainer>
  );
}
