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
                onFocus={() => {
                  // DO SOMETHING
                }}
                onChange={() => {
                  // DO SOMETHING
                }}
                onBlur={() => {
                  // DO SOMETHING
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
          {target && <AnnotationTarget id={target} onChange={(newValue: string) => {}} />}
        </FlexContainerColumn>
      </FlexContainerRow>
    </LightBox>
  );
};
