import { useContext, useEffect } from "react";

import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { Input, InputLabel } from "../Input";
import { ShadowContainer } from "../../atoms/ShadowContainer";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";

export const DimensionsForm: React.FC<{}> = () => {
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();

  const changeHeight = (data: string) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "height", data);
    }
  };

  const changeWidth = (data: string) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "width", data);
    }
  };

  const changeDuration = (data: string) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "duration", data);
    }
  };

  return (
    <ShadowContainer>
      <FlexContainer>
        <ErrorBoundary>
          <FlexContainerColumn>
            <InputLabel>{"height"}</InputLabel>
            <Input
              type="number"
              onChange={(e: any) => {
                changeHeight(e.target.value);
              }}
              value={canvas && canvas.height ? canvas.height : ""}
            />
            <InformationLink
              guidanceReference={"https://iiif.io/api/presentation/3.0/#height"}
            />
          </FlexContainerColumn>
        </ErrorBoundary>
        <ErrorBoundary>
          <FlexContainerColumn>
            <InputLabel>{"width"}</InputLabel>
            <Input
              type="number"
              onChange={(e: any) => {
                changeWidth(e.target.value);
              }}
              value={canvas && canvas.width ? canvas.width : ""}
            />
            <InformationLink
              guidanceReference={"https://iiif.io/api/presentation/3.0/#width"}
            />
          </FlexContainerColumn>
        </ErrorBoundary>
        <ErrorBoundary>
          <FlexContainerColumn>
            <InputLabel>{"duration"}</InputLabel>
            <Input
              type="number"
              onChange={(e: any) => {
                changeDuration(e.target.value);
              }}
              value={canvas && canvas.duration ? canvas.duration : ""}
            />
            <InformationLink
              guidanceReference={"https://iiif.io/api/presentation/3.0/#width"}
            />
          </FlexContainerColumn>
        </ErrorBoundary>
      </FlexContainer>
    </ShadowContainer>
  );
};
