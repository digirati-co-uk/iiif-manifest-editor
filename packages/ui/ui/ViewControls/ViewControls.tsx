import { useTranslations } from "@manifest-editor/i18n";
import type { CSSProperties, ReactNode } from "react";
import { useViewerPreset } from "react-iiif-vault";
import styled, { css } from "styled-components";
import { HomeIcon } from "../../icons/HomeIcon";
import { MinusIcon } from "../../icons/MinusIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { RotateIcon } from "../../icons/RotateIcon";

export const CanvasViewerButton = styled.button<{ $active?: boolean }>`
  padding: 0.8em;
  font-size: 1em;
  line-height: 1em;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  transition: background 500ms;
  &:focus {
    outline: 2px solid #ff9999;
  }

  &:disabled {
    opacity: 0.3;
    img {
      opacity: 0.3;
    }
  }

  ${(props) =>
    props.$active &&
    css`
      transition: none;
      background: #b84c74;
      color: #fff;
      &:hover {
        background: #892c4e;
        color: #fff;
      }
    `}
`;

export const CanvasViewerControls = styled.div`
  --vc-size: 2.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  position: absolute;
  top: 1em;
  right: calc(var(--manifest-editor-layout-right-sidebar-large, 0px) + 1em);
  z-index: 20;
`;

/**
 * Segmented column: zoom in and out are always visible, everything else (home, rotate and any extra actions) folds
 * out underneath while the group is hovered or has focus. The 1px gap shows the divider colour, so a collapsed button
 * also cancels its gap.
 */
const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);

  & > :first-child {
    border-top: 0;
  }
`;

const GroupButton = styled.button<{ $active?: boolean }>`
  width: var(--vc-size);
  height: var(--vc-size);
  padding: 0;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  /* Gray divider between segments; collapsed buttons cancel it with a negative margin. */
  border-top: 1px solid rgba(90, 90, 90, 0.3);
  border-radius: 0;
  background: transparent;
  color: #332f2c;
  font-size: 1.05rem;
  line-height: 1em;
  transition:
    background 140ms ease,
    max-height 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    margin-top 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }

  &:focus-visible {
    outline: 2px solid #ff9999;
    outline-offset: -2px;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #b84c74;
      color: #fff;
      &:hover {
        background: #892c4e;
      }
    `}
`;

const CollapsibleActions = styled.div`
  display: contents;

  & > ${GroupButton} {
    max-height: 0;
    margin-top: -1px;
    opacity: 0;
  }

  /* An active toggle (such as a set flag) stays visible so the state is never hidden. */
  & > ${GroupButton}[aria-pressed="true"] {
    max-height: var(--vc-size);
    margin-top: 0;
    opacity: 1;
  }

  /* :focus-visible rather than :focus-within, Atlas cancels mousedown so a clicked button would stay focused. */
  ${ControlGroup}:hover &, ${ControlGroup}:has(:focus-visible) & {
    & > ${GroupButton} {
      max-height: var(--vc-size);
      margin-top: 0;
      opacity: 1;
    }
  }

  /* No hover on touch screens: keep every button available. */
  @media (hover: none) {
    & > ${GroupButton} {
      max-height: var(--vc-size);
      margin-top: 0;
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    & > ${GroupButton} {
      transition: none;
    }
  }
`;

export { GroupButton as ViewControlsButton };

export function ViewControls({
  refresh,
  onHome,
  onZoomIn,
  onZoomOut,
  onRotate,
  showRotate = true,
  extraControls,
  actions,
  style,
}: {
  /** Double clicking home refreshes the viewer. */
  refresh?: () => void;
  /** Override the callbacks; each falls back to the Atlas runtime of the surrounding viewer preset. */
  onHome?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  showRotate?: boolean;
  /** Rendered beside the control group, always visible (selects, mode toggles). */
  extraControls?: ReactNode;
  /** Extra buttons for the collapsible section of the control group; use `ViewControlsButton` for these. */
  actions?: ReactNode;
  style?: CSSProperties;
}) {
  const t = useTranslations("ui");
  const preset = useViewerPreset();

  return (
    <CanvasViewerControls style={style}>
      {extraControls}
      <ControlGroup role="group" aria-label={t("viewer.controls")}>
        <GroupButton
          type="button"
          data-control="zoom-in"
          aria-label={t("viewer.zoomIn")}
          title={t("viewer.zoomIn")}
          onClick={() => (onZoomIn ? onZoomIn() : preset?.runtime.world.zoomTo(0.4))}
        >
          <PlusIcon title={t("viewer.zoomIn")} />
        </GroupButton>
        <GroupButton
          type="button"
          data-control="zoom-out"
          aria-label={t("viewer.zoomOut")}
          title={t("viewer.zoomOut")}
          onClick={() => (onZoomOut ? onZoomOut() : preset?.runtime.world.zoomTo(1 / 0.4))}
        >
          <MinusIcon title={t("viewer.zoomOut")} />
        </GroupButton>
        <CollapsibleActions>
          <GroupButton
            type="button"
            data-control="home"
            aria-label={t("viewer.home")}
            title={t("viewer.home")}
            onDoubleClick={refresh}
            onClick={() => (onHome ? onHome() : preset?.runtime.world.goHome())}
          >
            <HomeIcon title={t("viewer.home")} />
          </GroupButton>
          {showRotate ? (
            <GroupButton
              type="button"
              data-control="rotate"
              aria-label={t("viewer.rotate")}
              title={t("viewer.rotate")}
              onClick={() => (onRotate ? onRotate() : preset?.runtime.world.rotateBy(90))}
            >
              <RotateIcon title={t("viewer.rotate")} />
            </GroupButton>
          ) : null}
          {actions}
        </CollapsibleActions>
      </ControlGroup>
    </CanvasViewerControls>
  );
}
