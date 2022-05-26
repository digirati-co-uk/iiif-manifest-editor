import styled from "styled-components";
import { HomeIcon } from "../../../../icons/HomeIcon";
import { MinusIcon } from "../../../../icons/MinusIcon";
import { PlusIcon } from "../../../../icons/PlusIcon";

export const CanvasViewerButton = styled.button`
  padding: 0.8em;
  font-size: 1em;
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
  goHome,
  zoomIn,
  zoomOut,
}: {
  goHome: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) {
  return (
    <CanvasViewerControls>
      <CanvasViewerButton onClick={goHome}>
        <HomeIcon title={"Home"} />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={zoomOut}>
        <MinusIcon title={"Zoom out"} />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={zoomIn}>
        <PlusIcon title={"Zoom in"} />
      </CanvasViewerButton>
    </CanvasViewerControls>
  );
}
