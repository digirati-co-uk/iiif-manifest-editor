import { useState } from "react";
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

export const AnnotationSnippet: React.FC<AnnotationSnippetProps> = ({ type, body, onClick, id, target }) => {
  const [expand, setExpand] = useState(false);
  const vault = useVault();
  const annotation = useAnnotation({ id: id });
  console.log(vault && annotation && vault.get(annotation.body[0].id));
  console.log(body);
  return (
    <LightBox onClick={() => onClick(id)}>
      <FlexContainerRow>
        {target && <AnnotationPreview region={target.split("#xywh=")[1]} />}
        <FlexContainerColumn style={target ? { maxWidth: "60%" } : { maxWidth: "100%" }}>
          {!expand && <BodySnippet onClick={() => setExpand(true)}>{body}</BodySnippet>}
          {expand && (
            <FlexContainerRow>
              <InputUnderlined
                id={id}
                onChange={(e: any) => {
                  // @todo not working
                  vault.modifyEntityField(id, "value", e.target.value);
                }}
                as={Textarea}
                value={body}
              />
              <Button onClick={() => setExpand(false)}>
                <CloseIcon />
              </Button>
            </FlexContainerRow>
          )}

          <PaddingComponentSmall />
          <AnnotationType>{type}</AnnotationType>
          {target && <AnnotationTarget canvasID={target} annotationID={id} />}
        </FlexContainerColumn>
      </FlexContainerRow>
    </LightBox>
  );
};
