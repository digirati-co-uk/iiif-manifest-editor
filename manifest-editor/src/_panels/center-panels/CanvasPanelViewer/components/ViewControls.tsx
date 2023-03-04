import styled, { css } from "styled-components";
import { HomeIcon } from "@/icons/HomeIcon";
import { MinusIcon } from "@/icons/MinusIcon";
import { PlusIcon } from "@/icons/PlusIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { useViewerPreset } from "react-iiif-vault";
import { EditIcon } from "@/icons/EditIcon";
import back from "../../../../components/widgets/IIIFExplorer/icons/back.svg";
import { CSSProperties } from "react";
import { CropIcon } from "@/icons/CropIcon";

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

  &:disabled {
    opacity: 0.5;
    img {
      opacity: 0.5;
    }
  }

  ${(props) =>
    props.$active &&
    css`
      transition: none;
      background: #5197d8;
      color: #fff;
      &:hover {
        background: #5197d8;
        color: #fff;
      }
    `}
`;

export const CanvasViewerControls = styled.div`
  display: flex;
  position: absolute;
  top: 1em;
  right: 1em;
  z-index: 20;

  & > * ~ * {
    margin-left: 0.5em;
  }
`;

export function ViewControls({
  refresh,
  toggleEditMode,
  editMode,
  onNext,
  onPrevious,
  editIcon,
  clearSelection,
  enableNavigation,
  style,
}: {
  refresh?: () => void;
  toggleEditMode?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  clearSelection?: () => void;
  editMode?: boolean;
  editIcon?: boolean;
  enableNavigation?: boolean;
  style?: CSSProperties;
}) {
  const preset = useViewerPreset();

  return (
    <CanvasViewerControls style={style}>
      {toggleEditMode ? (
        <>
          <CanvasViewerButton data-control="edit" onClick={toggleEditMode} $active={editMode}>
            {editMode ? (
              "Finish editing"
            ) : editIcon ? (
              <EditIcon title={"Edit mode"} />
            ) : (
              <CropIcon title={"Edit mode"} />
            )}
          </CanvasViewerButton>
          {clearSelection && editMode ? (
            <CanvasViewerButton data-control="edit-clear" onClick={clearSelection}>
              Clear
            </CanvasViewerButton>
          ) : null}
        </>
      ) : null}
      {refresh ? (
        <CanvasViewerButton onClick={refresh}>
          <RefreshIcon title={"Refresh viewer"} />
        </CanvasViewerButton>
      ) : null}
      <CanvasViewerButton data-control="home" onClick={() => preset?.runtime.world.goHome()}>
        <HomeIcon title={"Home"} />
      </CanvasViewerButton>
      <CanvasViewerButton data-control="zoom-out" onClick={() => preset?.runtime.world.zoomTo(1 / 0.75)}>
        <MinusIcon title={"Zoom out"} />
      </CanvasViewerButton>
      <CanvasViewerButton data-control="zoom-in" onClick={() => preset?.runtime.world.zoomTo(0.75)}>
        <PlusIcon title={"Zoom in"} />
      </CanvasViewerButton>

      {enableNavigation ? (
        <>
          <CanvasViewerButton data-control="previous" disabled={!onPrevious} onClick={onPrevious}>
            <img src={back} width={16} />
          </CanvasViewerButton>
          <CanvasViewerButton data-control="next" disabled={!onNext} onClick={onNext}>
            <img src={back} width={16} style={{ transform: "rotate(180deg)" }} />
          </CanvasViewerButton>
        </>
      ) : null}
    </CanvasViewerControls>
  );
}
