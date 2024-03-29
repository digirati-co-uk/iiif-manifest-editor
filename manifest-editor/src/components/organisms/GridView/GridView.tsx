import { useManifestEditor } from "@/apps/ManifestEditorLegacy/ManifestEditor.context";
import { FlexContainer, FlexContainerRow } from "@/components/layout/FlexContainer";
import { AddIcon } from "@/icons/AddIcon";
import { GridViewContainer } from "./GridView.styles";
import { GridList } from "./GridList";
import { HeightWidthSwitcher, ThumbnailSize } from "@/atoms/HeightWidthSwitcher";
import { ModalButton } from "@/madoc/components/ModalButton";
import { NewCanvas } from "@/components/widgets/NewCanvas";
import { Button, CalltoButton } from "@/atoms/Button";
import { PaddingComponentSmall } from "@/atoms/PaddingComponent";
import { useCanvasSubset } from "@/hooks/useCanvasSubset";
import { Reference } from "@iiif/presentation-3";
import { InfoMessage } from "@/madoc/components/callouts/InfoMessage";
import { UniversalCopyTarget } from "@/shell";
import { usePasteCanvas } from "@/hooks/usePasteCanvas";

export const GridView: React.FC<{
  handleChange: (canvasId: string, thumbnail?: boolean) => void;
  handleChangeDouble?: (canvasId: string, thumbnail?: boolean) => void;
  width?: number;
  strip?: boolean;
  column?: boolean;
  canvasIds?: Array<string | Reference>;
  clearCanvases?: () => void;
}> = ({ handleChange, handleChangeDouble, width, strip, column, canvasIds, clearCanvases }) => {
  const canvases = useCanvasSubset(canvasIds);
  const editorContext = useManifestEditor();
  const onPasteCanvas = usePasteCanvas();

  if (canvases.length === 0) {
    return (
      <GridViewContainer
        strip={strip}
        style={{ justifyContent: "flex-start", width: "100%", padding: "0.75rem", height: "80vh" }}
      >
        <UniversalCopyTarget
          as={FlexContainer}
          onPasteAnalysis={onPasteCanvas}
          style={{ justifyContent: "center", width: "100%" }}
        >
          <ModalButton
            as={CalltoButton}
            render={({ close }) => (
              <NewCanvas
                close={() => {
                  close();
                }}
              />
            )}
            title="New Canvas"
          >
            <AddIcon height={300} color={"white"} />
            <PaddingComponentSmall />
            Add Canvas
          </ModalButton>
        </UniversalCopyTarget>
      </GridViewContainer>
    );
  }
  return (
    <>
      {clearCanvases ? (
        <InfoMessage>
          You are viewing only a subset of the canvases on this manifest{" "}
          <Button style={{ marginLeft: "1em" }} onClick={clearCanvases}>
            Show all
          </Button>
        </InfoMessage>
      ) : null}

      <UniversalCopyTarget as={GridViewContainer} onPasteAnalysis={onPasteCanvas} $column={strip}>
        <GridList handleChange={handleChange} handleChangeDouble={handleChangeDouble} canvasIds={canvasIds} />

        {!strip && (
          <FlexContainerRow>
            {/* <ViewSelector /> */}
            <HeightWidthSwitcher
              options={[
                { h: 128, w: 128 },
                { h: 256, w: 256 },
                { h: 512, w: 512 },
                { h: 1024, w: 1024 },
              ]}
              label={`${editorContext?.thumbnailSize?.w}x${editorContext?.thumbnailSize?.h}`}
              onOptionClick={(selected: ThumbnailSize) => editorContext?.setThumbnailSize(selected)}
            />
          </FlexContainerRow>
        )}
        {strip && (
          <>
            <PaddingComponentSmall />
            <ModalButton
              as={CalltoButton}
              render={({ close }) => (
                <NewCanvas
                  close={() => {
                    close();
                  }}
                />
              )}
              title="New Canvas"
            >
              <AddIcon height={300} color={"white"} />
              <PaddingComponentSmall />
              Add Canvas
            </ModalButton>
          </>
        )}
      </UniversalCopyTarget>
    </>
  );
};
