import { InputLabel } from "../form/Input";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ErrorBoundary } from "./ErrorBoundary";
import { InformationLink } from "./InformationLink";
import { Input } from "../form/Input";
import { EmptyProperty } from "./EmptyProperty";

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
          <InputLabel $inline={true}>
            {"height"}
            <InformationLink
              guidanceReference={"https://iiif.io/api/presentation/3.0/#height"}
            />
          </InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeHeight(e.target.value);
            }}
            value={height}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%" }}>
          <InputLabel $inline={true}>
            {"width"}
            <InformationLink
              guidanceReference={"https://iiif.io/api/presentation/3.0/#width"}
            />
          </InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeWidth(e.target.value);
            }}
            value={width}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%" }}>
          <InputLabel $inline={true}>
            {"duration"}
            <InformationLink
              guidanceReference={
                "https://iiif.io/api/presentation/3.0/#duration"
              }
            />
          </InputLabel>
          <Input
            type="number"
            onChange={(e: any) => {
              changeDuration(e.target.value);
            }}
            value={duration}
          />
        </FlexContainerColumn>
      </ErrorBoundary>
    </FlexContainer>
  );
};
