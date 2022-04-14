import { useEffect, useState } from "react";
import { Button } from "../atoms/Button";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { ThumbnailImg } from "../atoms/Thumbnail";
import { ThumbnailContainer } from "../atoms/ThumbnailContainer";
import { BackIcon } from "../icons/BackIcon";
import {
  FlexContainer,
  FlexContainerColumn,
  FlexContainerRow,
} from "../layout/FlexContainer";
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
  const [open, setOpen] = useState(false);

  return (
    <FlexContainer
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
      key={thumbnailSrc}
    >
      <FlexContainerColumn style={{ width: "20%" }}>
        {thumbnailSrc && thumbnailSrc !== "" && (
          <ThumbnailContainer size={128}>
            <ThumbnailImg src={thumbnailSrc} alt="thumbnail" />
          </ThumbnailContainer>
        )}
      </FlexContainerColumn>
      <FlexContainerColumn style={{ width: "80%" }}>
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
        <FlexContainer>
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
        </FlexContainer>

        <ErrorBoundary>
          <InputLabel>
            {serviceID &&
              serviceID?.map((service: any) => {
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
    </FlexContainer>
  );
};
