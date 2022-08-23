import styled, { css } from "styled-components";
import { HomeIcon } from "@/icons/HomeIcon";
import { MinusIcon } from "@/icons/MinusIcon";
import { PlusIcon } from "@/icons/PlusIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { useViewerPreset } from "react-iiif-vault";
import { EditIcon } from "@/icons/EditIcon";

export const CanvasViewerButton = styled.button<{ $active?: boolean }>`
  padding: 0.8em;
  font-size: 1em;
  line-height: 1em;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  backdrop-filter: blur(5px);
  transition: background 500ms;
  &:focus {
    outline: 2px solid #ff9999;
  }

  ${(props) =>
    props.$active &&
    css`
      transition: none;
      background: #5197d8;
      color: #fff;
      &:hover {
        background: #5197d8 !important;
        color: #fff;
      }
    `}
`;

export const CanvasViewerControls = styled.div`
  display: flex;
  position: absolute;
  top: 1.4em;
  right: 1.4em;
  z-index: 20;

  & > * ~ * {
    margin-left: 0.5em;
  }

  &:hover ${CanvasViewerButton} {
    background: #fff;
  }
`;

export function ViewControls({
  refresh,
  toggleEditMode,
  editMode,
}: {
  refresh: () => void;
  toggleEditMode: () => void;
  editMode?: boolean;
}) {
  const preset = useViewerPreset();
  return (
    <CanvasViewerControls>
      <CanvasViewerButton onClick={toggleEditMode} $active={editMode}>
        {editMode ? "Finish editing" : <EditIcon title={"Edit mode"} />}
      </CanvasViewerButton>
      <CanvasViewerButton onClick={refresh}>
        <RefreshIcon title={"Refresh viewer"} />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={() => preset?.runtime.world.goHome()}>
        <HomeIcon title={"Home"} />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={() => preset?.runtime.world.zoomTo(1 / 0.75)}>
        <MinusIcon title={"Zoom out"} />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={() => preset?.runtime.world.zoomTo(0.75)}>
        <PlusIcon title={"Zoom in"} />
      </CanvasViewerButton>
    </CanvasViewerControls>
  );
}
