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
  duration?: number;
  changeDuration?: (newDuration: number) => void;
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
    <FlexContainer style={{ marginBottom: "1em" }}>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputLabel $inline={true} htmlFor="dims-height">
            {"height"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#height"} />
          </InputLabel>
          <Input
            id="dims-height"
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
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputLabel $inline={true} htmlFor="dims-width">
            {"width"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#width"} />
          </InputLabel>
          <Input
            id="dims-width"
            min={0}
            type="number"
            onChange={(e: any) => {
              changeWidth(e.target.valueAsNumber);
            }}
            value={width}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      {changeDuration ? (
        <ErrorBoundary>
          <FlexContainerColumn style={{ width: "100%" }}>
            <InputLabel $inline={true} htmlFor="dims-duration">
              {"duration"}
              <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#duration"} />
            </InputLabel>
            <Input
              id="dims-duration"
              min={0}
              type="number"
              onChange={(e: any) => {
                changeDuration(e.target.valueAsNumber);
              }}
              value={duration}
            />
          </FlexContainerColumn>
        </ErrorBoundary>
      ) : null}
    </FlexContainer>
  );
};
