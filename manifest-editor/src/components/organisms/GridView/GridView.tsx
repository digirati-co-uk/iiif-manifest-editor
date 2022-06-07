import { useManifest } from "react-iiif-vault";

import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";

import { ViewSelector } from "../../../atoms/ViewSelector";
import { FlexContainer, FlexContainerRow } from "../../layout/FlexContainer";

import { AddIcon } from "../../../icons/AddIcon";

import { GridViewContainer } from "./GridView.styles";
import { GridList } from "./GridList";
import { HeightWidthSwitcher, ThumbnailSize } from "../../../atoms/HeightWidthSwitcher";
import { ModalButton } from "../../../madoc/components/ModalButton";
import { NewCanvas } from "../../widgets/NewCanvas";
import { CalltoButton } from "../../../atoms/Button";
import { PaddingComponentSmall } from "../../../atoms/PaddingComponent";

export const GridView: React.FC<{
  handleChange: (canvasId: string, thumbnail?: boolean) => void;
  width?: number;
  strip?: boolean;
  column?: boolean;
}> = ({ handleChange, width, strip, column }) => {
  const manifest = useManifest();

  const editorContext = useManifestEditor();

  const dispatchType = "items";

  if (!manifest || !manifest[dispatchType] || manifest[dispatchType].length <= 0) {
    return (
      <GridViewContainer
        strip={strip}
        style={{ justifyContent: "flex-start", width: "100%", padding: "0.75rem", height: "80vh" }}
      >
        <FlexContainer style={{ justifyContent: "center", width: "100%" }}>
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
        </FlexContainer>
      </GridViewContainer>
    );
  }
  return (
    <GridViewContainer $column={strip}>
      <GridList handleChange={handleChange} />
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
    </GridViewContainer>
  );
};
