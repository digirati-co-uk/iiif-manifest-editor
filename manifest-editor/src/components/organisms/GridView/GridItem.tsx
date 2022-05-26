import { getValue } from "@iiif/vault-helpers";
import { useCallback, useState } from "react";
import { useCanvas, useManifest } from "react-iiif-vault";
import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";
import { DropdownContent } from "../../../atoms/Dropdown";
import { DropdownItem } from "../../../atoms/DropdownPreviewMenu";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { HorizontalDivider } from "../../../atoms/HorizontalDivider";
import { Thumbnail } from "../../../atoms/Thumbnail";
import { MoreVertical } from "../../../icons/MoreVertical";
import { FlexContainerColumn } from "../../layout/FlexContainer";
import { Group, ThumbnailContainer, ThumnbnailLabel } from "./GridView.styles";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { Reference } from "@iiif/presentation-3";

export const GridItem: React.FC<{
  handleChange: (id: string, e: any) => void;
  canvasId: string;
  reorder: (fromPosition: number, toPosition: number) => void;
  remove: (fromPosition: number, ref: Reference) => void;
  index: number;
}> = ({ handleChange, canvasId, reorder, remove, index }) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const canvas = useCanvas();
  const editorContext = useManifestEditor();
  const manifest = useManifest();
  const { state, setState } = useAppState();
  const currentCanvasId = state.canvasId;
  const dispatchType = "items";

  const showContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // Disable the default context menu
    event.preventDefault();

    setContextMenuVisible(false);
    const newPosition = {
      x: event.pageX,
      y: event.pageY,
    };

    setAnchorPoint(newPosition);
    setContextMenuVisible(true);
  };

  const changeCanvas = useCallback(() => setState({ canvasId }), [canvasId, setState]);

  return (
    <Group onClick={changeCanvas}>
      {contextMenuVisible && (
        <DropdownContent
          style={{ top: anchorPoint.y, left: anchorPoint.x }}
          onMouseLeave={() => setContextMenuVisible(false)}
        >
          <DropdownItem
            onClick={() => {
              editorContext.setAddCanvasModalOpen(true);
            }}
          >
            New canvas
          </DropdownItem>
          <HorizontalDivider />
          <DropdownItem
            onClick={() => {
              reorder(index, 0);
              setContextMenuVisible(false);
            }}
          >
            Move to beginning
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              if (
                manifest &&
                manifest[dispatchType] &&
                Array.isArray(manifest[dispatchType]) &&
                manifest[dispatchType]
              ) {
                reorder(index, manifest[dispatchType].length - 1);
              }
              setContextMenuVisible(false);
            }}
          >
            Move to end
          </DropdownItem>
          <HorizontalDivider />
          <DropdownItem
            onClick={() => {
              remove(index, { id: canvasId, type: "Canvas" });
              setContextMenuVisible(false);
            }}
          >
            Delete canvas
          </DropdownItem>
        </DropdownContent>
      )}
      <FlexContainerColumn>
        <ThumbnailContainer
          onClick={(e: any) => {
            handleChange(canvasId, e);
            setContextMenuVisible(false);
          }}
          size={editorContext?.thumbnailSize?.w}
          selected={canvasId === currentCanvasId}
        >
          <ErrorBoundary>
            <Thumbnail
              onClick={changeCanvas}
              width={editorContext?.thumbnailSize?.w}
              height={editorContext?.thumbnailSize?.h}
            />
          </ErrorBoundary>
        </ThumbnailContainer>
        <ThumnbnailLabel title={getValue(canvas?.label)}>{getValue(canvas?.label)}</ThumnbnailLabel>
      </FlexContainerColumn>
      <div className="item" onClick={(e: React.MouseEvent<HTMLDivElement>) => showContextMenu(e)}>
        <MoreVertical color={"white"} />
      </div>
    </Group>
  );
};
