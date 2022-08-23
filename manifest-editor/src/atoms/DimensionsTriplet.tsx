import { InputLabel } from "../editors/Input";
import { FlexContainer, FlexContainerColumn } from "../components/layout/FlexContainer";
import { ErrorBoundary } from "./ErrorBoundary";
import { InformationLink } from "./InformationLink";
import { Input } from "../editors/Input";

type Dimensions = {
  width: number;
  changeWidth?: (newNumber: number) => void;
  height: number;
  changeHeight?: (newHeight: number) => void;
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
    <FlexContainer>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputLabel $inline={true} htmlFor="dims-height">
            {"Height"}
            <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#height"} />
          </InputLabel>
          <Input
            id="dims-height"
            name="dims-height"
            min={0}
            type="number"
            onChange={
              changeHeight
                ? (e: any) => {
                    changeHeight(e.target.valueAsNumber);
                  }
                : undefined
            }
            {...{ [changeHeight ? "value" : "defaultValue"]: height }}
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
            name="dims-width"
            min={0}
            type="number"
            onChange={
              changeWidth
                ? (e: any) => {
                    changeWidth(e.target.valueAsNumber);
                  }
                : undefined
            }
            {...{ [changeWidth ? "value" : "defaultValue"]: width }}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      {typeof duration !== "undefined" ? (
        <ErrorBoundary>
          <FlexContainerColumn style={{ width: "100%" }}>
            <InputLabel $inline={true} htmlFor="dims-duration">
              {"duration"}
              <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#duration"} />
            </InputLabel>
            <Input
              id="dims-duration"
              name="dims-duration"
              min={0}
              type="number"
              onChange={
                changeDuration
                  ? (e: any) => {
                      changeDuration(e.target.valueAsNumber);
                    }
                  : undefined
              }
              {...{ [changeDuration ? "value" : "defaultValue"]: duration }}
            />
          </FlexContainerColumn>
        </ErrorBoundary>
      ) : null}
    </FlexContainer>
  );
};
