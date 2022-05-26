import { useManifest } from "react-iiif-vault";

import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";

import { ViewSelector } from "../../../atoms/ViewSelector";
import { FlexContainer, FlexContainerRow } from "../../layout/FlexContainer";

import { RecentLabel } from "../../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../../atoms/TemplateCard";
import { AddIcon } from "../../../icons/AddIcon";

import { HeightWidthSwitcher, ThumbnailSize } from "../../../atoms/HeightWidthSwitcher";

import { GridViewContainer } from "./GridView.styles";
import { GridList } from "./GridList";

export const GridView: React.FC<{ handleChange: (canvasId: string, thumbnail?: boolean) => void }> = ({
  handleChange,
}) => {
  const manifest = useManifest();

  const editorContext = useManifestEditor();

  const dispatchType = "items";

  if (!manifest || !manifest[dispatchType] || manifest[dispatchType].length <= 0) {
    return (
      <GridViewContainer>
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <TemplateCardContainer onClick={() => editorContext?.setAddCanvasModalOpen(true)}>
            <TemplateCardNew>
              <AddIcon />
            </TemplateCardNew>
            <RecentLabel>Add</RecentLabel>
          </TemplateCardContainer>
        </FlexContainer>

        <ViewSelector />
      </GridViewContainer>
    );
  }
  return (
    <GridViewContainer>
      <GridList handleChange={handleChange} />
      <FlexContainerRow>
        <ViewSelector />
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
    </GridViewContainer>
  );
};