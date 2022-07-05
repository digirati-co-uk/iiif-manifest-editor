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

const AnnotationBodyEditor: React.FC<BodyEditorProps> = ({ annotationID, bodyID, value, close }) => {
  const annotation = useAnnotation({ id: annotationID });
  const vault = useVault();
  console.log(value);

  useEffect(() => {
    vault.modifyEntityField({ id: bodyID, type: "ContentResource" }, "value", "TESTING");
  }, []);

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
        value={value}
      />
      <Button onClick={close}>
        <CloseIcon />
      </Button>
    </FlexContainerRow>
  );
};

export const AnnotationSnippet: React.FC<AnnotationSnippetProps> = ({ type, body, onClick, id, target }) => {
  const [expand, setExpand] = useState(false);
  const annotation = useAnnotation({ id: id });
  const vault = useVault();
  console.log(vault.get(annotation.body[0].id));
  if (!annotation) {
    return <></>;
  }
  return (
    <LightBox onClick={() => onClick(id)}>
      <FlexContainerRow>
        {target && <AnnotationPreview region={target.split("#xywh=")[1]} />}
        <PaddingComponentSmall />
        <FlexContainerColumn style={{ width: "80%" }}>
          {!expand && (
            // @ts-ignore
            <BodySnippet onClick={() => setExpand(true)}>{body}</BodySnippet>
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
          {/* @ts-ignore */}
          {annotation.target && <AnnotationTarget canvasTarget={annotation.target} annotationID={annotation.id} />}
        </FlexContainerColumn>
      </FlexContainerRow>
    </LightBox>
  );
};
