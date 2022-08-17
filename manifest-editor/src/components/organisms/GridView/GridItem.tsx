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
import { ModalButton } from "../../../madoc/components/ModalButton";
import { NewCanvas } from "../../widgets/NewCanvas";
import { Reference } from "@iiif/presentation-3";
import { CanvasThumbnail } from "../CanvasThumbnail/CanvasThumbnail";

export const GridItem: React.FC<{
  handleChange: (id: string, e: any) => void;
  handleChangeDouble: (id: string, e: any) => void;
  canvasId: string;
  reorder?: (fromPosition: number, toPosition: number) => void;
  remove: (fromPosition: number, ref: Reference) => void;
  index: number;
}> = ({ handleChange, handleChangeDouble, canvasId, reorder, remove, index }) => {
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
    <Group onClick={changeCanvas} onMouseLeave={() => setContextMenuVisible(false)}>
      {contextMenuVisible && (
        <DropdownContent
          style={{ top: anchorPoint.y, left: anchorPoint.x }}
          onMouseLeave={() => setContextMenuVisible(false)}
        >
          <ModalButton
            as={DropdownItem}
            render={({ close }) => (
              <NewCanvas
                close={() => {
                  close();
                  setContextMenuVisible(false);
                }}
              />
            )}
            title="New Canvas"
          >
            New canvas
          </ModalButton>
          <HorizontalDivider />
          {reorder ? (
            <>
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
            </>
          ) : null}
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
      <FlexContainerColumn style={{ maxWidth: editorContext?.thumbnailSize?.w + 10 }}>
        <ThumbnailContainer
          onClick={(e: any) => {
            handleChange(canvasId, e);
          }}
          onDoubleClick={(e: any) => {
            handleChangeDouble(canvasId, e);
          }}
          // size={editorContext?.thumbnailSize?.w}
          selected={canvasId === currentCanvasId}
        >
          <ErrorBoundary>
            <CanvasThumbnail onClick={changeCanvas} size={editorContext?.thumbnailSize?.w} />
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
