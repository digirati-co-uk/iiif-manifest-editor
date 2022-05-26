import { InputLabel } from "../editors/Input";
import { FlexContainer, FlexContainerColumn } from "../components/layout/FlexContainer";
import { ErrorBoundary } from "./ErrorBoundary";
import { InformationLink } from "./InformationLink";
import { Input } from "../editors/Input";

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
        <FlexContainerColumn style={{ width: "100%", padding: "0.2em" }}>
          <InputLabel $inline={true}>
            {"height"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#height"} />
          </InputLabel>
          <Input
            min={0}
            type="number"
            onChange={(e: any) => {
              changeHeight(e.target.valueAsNumber);
            }}
            value={height}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%", padding: "0.2em" }}>
          <InputLabel $inline={true}>
            {"width"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#width"} />
          </InputLabel>
          <Input
            min={0}
            type="number"
            onChange={(e: any) => {
              changeWidth(e.target.valueAsNumber);
            }}
            value={width}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%", padding: "0.2em" }}>
          <InputLabel $inline={true}>
            {"duration"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#duration"} />
          </InputLabel>
          <Input
            min={0}
            type="number"
            onChange={(e: any) => {
              changeDuration(e.target.valueAsNumber);
            }}
            value={duration}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
    </FlexContainer>
  );
};
