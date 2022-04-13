import { useEffect } from "react";
import { Button } from "../atoms/Button";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { ThumbnailImg } from "../atoms/Thumbnail";
import { ThumbnailContainer } from "../atoms/ThumbnailContainer";
import { BackIcon } from "../icons/BackIcon";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { InputLabel, Input } from "./Input";

interface MediaResourceEditorProps {
  backFunction?: () => void;
  thumbnailSrc: string;
  changeHeight: (height: number) => void;
  changeWidth: (width: number) => void;
  height: number;
  width: number;
  type: string;
  changeType: (type: string) => void;
  changeThumbnailSrc: (url: string) => void;
  serviceID: any[];
}

export const MediaResourceEditor: React.FC<MediaResourceEditorProps> = ({
  backFunction,
  thumbnailSrc,
  changeHeight,
  changeWidth,
  height,
  width,
  changeType,
  type,
  changeThumbnailSrc,
  serviceID,
}) => {
  return (
    <FlexContainerColumn
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
      key={thumbnailSrc}
    >
      {backFunction && (
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <Button onClick={backFunction} aria-label="go back">
            <BackIcon />
          </Button>
        </FlexContainer>
      )}

      <ThumbnailContainer size={128}>
        <ThumbnailImg src={thumbnailSrc} alt="thumbnail" />
      </ThumbnailContainer>
      <ErrorBoundary>
        <InputLabel>
          id
          <Input
            type="string"
            onBlur={(e: any) => {
              changeThumbnailSrc(e.target.value);
            }}
            defaultValue={thumbnailSrc}
          />
        </InputLabel>
      </ErrorBoundary>
      <ErrorBoundary>
        <InputLabel>
          height
          <Input
            type="number"
            onChange={(e: any) => {
              changeHeight(e.target.value);
            }}
            defaultValue={height}
          />
        </InputLabel>
      </ErrorBoundary>
      <ErrorBoundary>
        <InputLabel>
          width
          <Input
            type="number"
            onChange={(e: any) => {
              changeWidth(e.target.value);
            }}
            defaultValue={width}
          />
        </InputLabel>
      </ErrorBoundary>
      <ErrorBoundary>
        <InputLabel>
          type
          <Input
            type="string"
            onBlur={(e: any) => {
              changeType(e.target.value);
            }}
            defaultValue={type}
          />
        </InputLabel>
      </ErrorBoundary>
      <ErrorBoundary>
        <InputLabel>
          service
          {serviceID?.map((service: any) => {
            return (
              <Input
                type="string"
                onBlur={(e: any) => {
                  console.log("NOT YET IMPLIMENTED");
                }}
                defaultValue={service["@id"]}
              />
            );
          })}
        </InputLabel>
      </ErrorBoundary>
    </FlexContainerColumn>
  );
};
