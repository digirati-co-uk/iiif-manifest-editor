import { useAnnotation, useVault, useVaultSelector } from "react-iiif-vault";
import { InputLabel, InputUnderlined } from "../../../editors/Input";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import Textarea from "react-textarea-autosize";

type BodyEditorProps = {
  annotationID: string;
  bodyID: string;
};

export const AnnotationBody: React.FC<BodyEditorProps> = ({ annotationID, bodyID }) => {
  const annotation = useAnnotation({ id: annotationID });
  const vault = useVault();

  const body = useVaultSelector((state) => state.iiif.entities.ContentResource[bodyID]) as any;
  console.log(body);
  function updateAnnotation(newValue: string) {
    vault.modifyEntityField({ id: bodyID, type: "ContentResource" }, "value", newValue);
  }
  if (!annotation) return <></>;
  return (
    <FlexContainerColumn>
      <InputLabel>
        Value
        <InputUnderlined
          id={annotation.id}
          onChange={(e: any) => updateAnnotation(e.target.value)}
          as={Textarea}
          value={body.value}
        />
      </InputLabel>
      <InputLabel>
        Type
        <InputUnderlined
          id={annotation.id}
          onChange={(e: any) =>
            vault.modifyEntityField({ id: body.id, type: "ContentResource" }, "type", e.target.value)
          }
          value={body.type}
        />
      </InputLabel>
      <InputLabel>
        Format
        <InputUnderlined
          id={annotation.id}
          onChange={(e: any) =>
            vault.modifyEntityField({ id: body.id, type: "ContentResource" }, "format", e.target.value)
          }
          value={body.format}
        />
      </InputLabel>
    </FlexContainerColumn>
  );
};
