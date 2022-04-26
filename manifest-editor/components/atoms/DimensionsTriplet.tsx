import { InputLabel } from "../form/Input";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ErrorBoundary } from "./ErrorBoundary";
import { InformationLink } from "./InformationLink";
import { Input } from "../form/Input";

type Dimensions = {
  width: number;
  changeWidth: (newNumber: number) => void;
  height: number;
  changeHeight: (newHeight: number) => void;
  duration: number;
  changeDuration: (newDuration: number) => void;
};

export const DimensionsTriplet: React.FC<Dimensions> = ({
  height,
  width,
  duration,
  changeWidth,
  changeHeight,
  changeDuration,
}) => {
  return (
    <FlexContainer>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%" }}>
          <InputLabel>{"height"}</InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeHeight(e.target.value);
            }}
            value={height}
          />
          <InformationLink
            guidanceReference={"https://iiif.io/api/presentation/3.0/#height"}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%" }}>
          <InputLabel>{"width"}</InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeWidth(e.target.value);
            }}
            value={width}
          />
          <InformationLink
            guidanceReference={"https://iiif.io/api/presentation/3.0/#width"}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%" }}>
          <InputLabel>{"duration"}</InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeDuration(e.target.value);
            }}
            value={duration}
          />
          <InformationLink
            guidanceReference={"https://iiif.io/api/presentation/3.0/#duration"}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
    </FlexContainer>
  );
};
