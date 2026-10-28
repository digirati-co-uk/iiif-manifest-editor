import { propertyLabels, documentation } from "@manifest-editor/editor-api";
import { useDisplayLabel } from "../i18n";
import { useEditorI18n } from "@manifest-editor/i18n";
import { InputLabel, Input } from "./Input";
import { FlexContainer, FlexContainerColumn } from "@manifest-editor/ui/components/layout/FlexContainer";
import { ErrorBoundary } from "@manifest-editor/ui/atoms/ErrorBoundary";
import { InformationLink } from "@manifest-editor/ui/atoms/InformationLink";

type Dimensions = {
  width: number;
  changeWidth?: (newNumber: number) => void;
  height: number;
  changeHeight?: (newHeight: number) => void;
  duration?: number;
  changeDuration?: (newDuration: number) => void;
  widthId?: string;
  heightId?: string;
  durationId?: string;
};

export const DimensionsTriplet: React.FC<Dimensions> = ({
  height,
  width,
  duration,
  changeWidth,
  changeHeight,
  changeDuration,
  widthId,
  heightId,
  durationId,
}) => {
  const apiLabel = useDisplayLabel();
  const { resolveMessage } = useEditorI18n();
  return (
    <FlexContainer style={{ marginBottom: "1em" }}>
      <ErrorBoundary>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }} id={heightId}>
          <InputLabel $inline={true} htmlFor="dims-height">
            {apiLabel(propertyLabels.height)}
            <span
              title={resolveMessage(
                documentation.technical.height.summaryMessage,
                documentation.technical.height.summary
              )}
            >
              <InformationLink guidanceReference={documentation.technical.height.link} />
            </span>
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
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }} id={widthId}>
          <InputLabel $inline={true} htmlFor="dims-width">
            {apiLabel(propertyLabels.width)}
            <span
              title={resolveMessage(
                documentation.technical.width.summaryMessage,
                documentation.technical.width.summary
              )}
            >
              <InformationLink guidanceReference={documentation.technical.width.link} />
            </span>
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
          <FlexContainerColumn style={{ width: "100%" }} id={durationId}>
            <InputLabel $inline={true} htmlFor="dims-duration">
              {apiLabel(propertyLabels.duration)}
              <span
                title={resolveMessage(
                  documentation.technical.duration.summaryMessage,
                  documentation.technical.duration.summary
                )}
              >
                <InformationLink guidanceReference={documentation.technical.duration.link} />
              </span>
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
