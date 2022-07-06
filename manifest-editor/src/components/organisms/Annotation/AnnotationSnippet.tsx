import { useEffect, useState } from "react";
import { LightBox } from "../../../atoms/LightBox";
import { PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { AnnotationType, BodySnippet } from "./Annotation.styles";
import Textarea from "react-textarea-autosize";
import { InputUnderlined } from "../../../editors/Input";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { CloseIcon } from "../../../icons/CloseIcon";
import { Button } from "../../../atoms/Button";
import { AnnotationTarget } from "./AnnotationTarget";
import { AnnotationPreview } from "./AnnotationPreview";
import { useVault } from "react-iiif-vault";
import { useAnnotation } from "../../../hooks/useAnnotation";
import { useVaultSelector } from "../../../hooks/useVaultSelector";

type AnnotationSnippetProps = {
  type: string;
  body: string;
  id: string;
  onClick: (id: string) => void;
  edit: (body: string) => void;
  target: string;
};

type BodyEditorProps = {
  annotationID: string;
  bodyID: string;
  value: any;
  close: () => void;
};

const AnnotationBodyEditor: React.FC<BodyEditorProps> = ({ annotationID, bodyID, close }) => {
  const annotation = useAnnotation({ id: annotationID });
  const vault = useVault();

  const body = useVaultSelector((state) => state.iiif.entities.ContentResource[bodyID]) as any;

  function updateAnnotation(newValue: string) {
    vault.modifyEntityField({ id: bodyID, type: "ContentResource" }, "value", newValue);
  }
  if (!annotation) return <></>;
  return (
    <FlexContainerRow>
      <InputUnderlined
        id={annotation.id}
        onChange={(e: any) => updateAnnotation(e.target.value)}
        as={Textarea}
        value={body.value}
      />
      <Button onClick={close}>
        <CloseIcon /> close
      </Button>
    </FlexContainerRow>
  );
};

export const AnnotationSnippet: React.FC<AnnotationSnippetProps> = ({ type, id, target }) => {
  const [expand, setExpand] = useState(false);
  const annotation = useAnnotation({ id: id });
  // @ts-ignore
  const body = useVaultSelector((state) => state.iiif.entities.ContentResource[annotation?.body[0].id]) as any;

  if (!annotation) {
    return <></>;
  }
  return (
    <LightBox>
      <FlexContainerRow>
        {target ? <AnnotationPreview region={target.split("#xywh=")[1]} /> : "No target specified"}
        <PaddingComponentSmall />
        <FlexContainerColumn style={{ width: "80%" }}>
          {!expand && (
            // @ts-ignore
            <BodySnippet onClick={() => setExpand(true)}>{body.value === "" ? "no value" : body.value}</BodySnippet>
          )}
          {expand && (
            <AnnotationBodyEditor
              annotationID={annotation.id}
              bodyID={annotation.body[0].id}
              value={body}
              close={() => setExpand(false)}
            />
          )}

          <PaddingComponentSmall />
          <AnnotationType>{type}</AnnotationType>
          {annotation.target && <AnnotationTarget canvasTarget={annotation.target} annotationID={annotation.id} />}
        </FlexContainerColumn>
      </FlexContainerRow>
    </LightBox>
  );
};
