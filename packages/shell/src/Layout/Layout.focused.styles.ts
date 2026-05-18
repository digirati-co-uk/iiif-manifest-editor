import styled, { css } from "styled-components";

const focusedExhibition = ".manifest-editor.exhibition-focused &";
const darkFocusedExhibition = `[data-exhibition-theme="dark"] ${focusedExhibition}`;

const exhibitionColours = {
  pink: "#b84c74",
  pinkHover: "#9f3f64",
  lightApp: "#f4f1ec",
  lightStage: "#dfdbd4",
  lightPanel: "#fff",
  lightPanelSoft: "#f8f6f3",
  lightBorder: "#dcd5ce",
  lightPanelBorder: "#ddd5ce",
  lightText: "#25211f",
  lightMuted: "#6a625c",
  darkApp: "#18161d",
  darkStage: "#0e0d12",
  darkPanel: "#28222d",
  darkPanelSoft: "#2f2934",
  darkPanelHeader: "#25222b",
  darkHover: "#312c34",
  darkSelected: "#3a3440",
  darkText: "#f6f1f4",
  darkMuted: "#cfc4cc",
  darkLabel: "#d9d1da",
  darkBorder: "rgba(246, 241, 244, 0.16)",
  darkBorderSoft: "rgba(246, 241, 244, 0.14)",
};

export const Main = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  overflow: hidden;

  ${focusedExhibition} {
    background: ${exhibitionColours.lightApp};
  }

  ${darkFocusedExhibition} {
    background: ${exhibitionColours.darkApp};
  }
`;

export const CenterPanel = styled.div`
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  background: #e3e7f0;
  padding-top: 1px;
  overflow: hidden;

  ${focusedExhibition} {
    background: ${exhibitionColours.lightApp};
  }

  ${darkFocusedExhibition} {
    background: ${exhibitionColours.darkApp};
  }

  > * {
    min-width: 0;
  }

  ${focusedExhibition} > .delft-exhibition {
    background: ${exhibitionColours.lightStage};
    color: ${exhibitionColours.lightText};
  }

  ${focusedExhibition} .atlas-container {
    --atlas-background: ${exhibitionColours.lightStage} !important;
    background: ${exhibitionColours.lightStage} !important;
  }

  ${focusedExhibition} .atlas-canvas {
    background: ${exhibitionColours.lightStage} !important;
  }

  ${darkFocusedExhibition} > .delft-exhibition {
    background: ${exhibitionColours.darkStage};
    color: ${exhibitionColours.darkText};
  }

  ${darkFocusedExhibition} .atlas-container {
    --atlas-background: ${exhibitionColours.darkStage} !important;
    background: ${exhibitionColours.darkStage} !important;
  }

  ${darkFocusedExhibition} .atlas-canvas {
    background: ${exhibitionColours.darkStage} !important;
  }

  ${darkFocusedExhibition} [class*="CanvasContainer"],
  ${darkFocusedExhibition} [class*="ViewerContainer"] {
    background: ${exhibitionColours.darkStage} !important;
  }
`;

export const LoadingCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const PanelSwitcher = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 1rem;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);

  ${focusedExhibition} {
    border-color: ${exhibitionColours.lightBorder};
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 22px rgba(38, 33, 42, 0.12);
  }

  ${darkFocusedExhibition} {
    border-color: ${exhibitionColours.darkBorder};
    background: rgba(38, 33, 42, 0.94);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.36);
  }

  ${(props) =>
    props.$side === "left"
      ? css`
          left: 1rem;
        `
      : css`
          right: 1rem;
        `}
`;

export const PanelSwitchButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background: #f2f3f6;
    color: #111827;
  }

  &[data-selected="true"] {
    background: ${exhibitionColours.pink};
    color: #fff;
  }

  ${focusedExhibition} {
    color: ${exhibitionColours.lightMuted};
  }

  ${focusedExhibition}:hover {
    background: #f5eaf0;
    color: ${exhibitionColours.lightText};
  }

  ${focusedExhibition}[data-selected="true"] {
    background: ${exhibitionColours.pink};
    color: #fff;
  }

  ${darkFocusedExhibition} {
    color: #efe8ed;
  }

  ${darkFocusedExhibition}:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  ${darkFocusedExhibition}[data-selected="true"] {
    background: ${exhibitionColours.pink};
    color: #fff;
  }

  svg {
    width: 1.25em;
    height: 1.25em;
  }
`;

export const PanelSwitchGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PanelSwitchDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.25rem 0;
  background: rgba(15, 23, 42, 0.14);
`;

export const FloatingPanel = styled.aside<{
  $side: "left" | "right";
  $open: boolean;
}>`
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  z-index: 35;
  display: flex;
  min-width: min(320px, calc(100vw - 2rem));
  max-width: min(720px, calc(100vw - 2rem));
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 6px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  opacity: ${(props) => (props.$open ? 1 : 0)};
  pointer-events: ${(props) => (props.$open ? "auto" : "none")};
  transition:
    opacity 180ms ease,
    transform 180ms ease;

  ${focusedExhibition} {
    background: ${exhibitionColours.lightPanel};
    border-color: ${exhibitionColours.lightPanelBorder};
    border-radius: 10px;
    color: ${exhibitionColours.lightText};
    box-shadow: 0 18px 42px rgba(38, 33, 42, 0.14);
  }

  ${focusedExhibition} [class~="bg-white"] {
    background-color: ${exhibitionColours.lightPanel} !important;
  }

  ${focusedExhibition} [class*="bg-[#f8f6f3]"] {
    background-color: ${exhibitionColours.lightPanelSoft} !important;
  }

  ${focusedExhibition} [class*="border-[#dcd5ce]"] {
    border-color: ${exhibitionColours.lightBorder} !important;
  }

  ${focusedExhibition} [data-tabs] {
    background: ${exhibitionColours.lightPanel};
    border-color: ${exhibitionColours.lightPanelBorder};
    color: ${exhibitionColours.lightText};
  }

  ${darkFocusedExhibition} {
    background: ${exhibitionColours.darkPanel};
    border-color: ${exhibitionColours.darkBorderSoft};
    color: ${exhibitionColours.darkText};
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.42);
  }

  ${darkFocusedExhibition} [class~="bg-white"],
  ${darkFocusedExhibition} [class*="bg-[#f8f6f3]"] {
    background-color: ${exhibitionColours.darkPanelSoft} !important;
  }

  ${darkFocusedExhibition} [class*="bg-gray-200"],
  ${darkFocusedExhibition} [class*="bg-gray-100"],
  ${darkFocusedExhibition} [class*="bg-me-gray-100"] {
    background-color: ${exhibitionColours.darkPanelHeader} !important;
    color: ${exhibitionColours.darkText} !important;
  }

  ${darkFocusedExhibition} [class*="hover:bg-gray-100"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-gray-200"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-gray-300"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-gray-100"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-gray-300"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-50"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-100"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-primary-50"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-primary-100"]:hover {
    background-color: ${exhibitionColours.darkHover} !important;
    color: #fff !important;
  }

  ${darkFocusedExhibition} [class*="hover:text-black"]:hover,
  ${darkFocusedExhibition} [class*="hover:text-gray-"]:hover,
  ${darkFocusedExhibition} [class*="hover:text-me-"]:hover {
    color: #fff !important;
  }

  ${darkFocusedExhibition} label {
    background-color: ${exhibitionColours.darkPanel} !important;
    color: ${exhibitionColours.darkLabel} !important;
  }

  ${darkFocusedExhibition} fieldset {
    border-color: ${exhibitionColours.darkBorder} !important;
  }

  ${darkFocusedExhibition} [data-tabs] {
    background: ${exhibitionColours.darkPanel};
    color: ${exhibitionColours.darkText};
    box-shadow:
      inset 0 -1px 0 0 ${exhibitionColours.darkBorder},
      inset 0 1px 0 0 rgba(246, 241, 244, 0.12);
  }

  ${darkFocusedExhibition} [class*="bg-me-gray-100"] {
    background-color: ${exhibitionColours.darkPanelHeader} !important;
    color: ${exhibitionColours.darkText} !important;
  }

  ${darkFocusedExhibition} [class*="border-b-me-gray-300"] {
    border-bottom-color: ${exhibitionColours.darkSelected} !important;
  }

  ${darkFocusedExhibition} [class*="hover:bg-me-gray-300"]:hover,
  ${darkFocusedExhibition} [class*="bg-me-gray-300"] {
    background-color: ${exhibitionColours.darkHover} !important;
    color: #fff !important;
  }

  ${darkFocusedExhibition} [data-active],
  ${darkFocusedExhibition} [data-selected],
  ${darkFocusedExhibition} [aria-selected="true"],
  ${darkFocusedExhibition} [data-canvas-selected="true"] {
    color: #fff !important;
  }

  ${darkFocusedExhibition} [data-active="true"],
  ${darkFocusedExhibition} [data-selected="true"],
  ${darkFocusedExhibition} [aria-selected="true"] {
    background-color: ${exhibitionColours.darkSelected} !important;
  }

  ${darkFocusedExhibition} [class*="bg-me-primary-500"],
  ${darkFocusedExhibition} [class*="bg-me-500"],
  ${darkFocusedExhibition} [class*="bg-me-700"] {
    background-color: ${exhibitionColours.pink} !important;
    color: #fff !important;
  }

  ${darkFocusedExhibition} [class*="hover:bg-me-primary-500"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-primary-600"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-600"]:hover,
  ${darkFocusedExhibition} [class*="hover:bg-me-800"]:hover {
    background-color: ${exhibitionColours.pinkHover} !important;
    color: #fff !important;
  }

  ${darkFocusedExhibition} [class*="text-[#25211f]"],
  ${darkFocusedExhibition} [class*="text-black"] {
    color: ${exhibitionColours.darkText} !important;
  }

  ${darkFocusedExhibition} [class*="text-[#6a625c]"],
  ${darkFocusedExhibition} [class*="text-[#8a827c]"] {
    color: ${exhibitionColours.darkMuted} !important;
  }

  ${darkFocusedExhibition} [class*="border-[#dcd5ce]"],
  ${darkFocusedExhibition} [class*="border-[#e4ddd6]"],
  ${darkFocusedExhibition} .border,
  ${darkFocusedExhibition} .border-b {
    border-color: ${exhibitionColours.darkBorder} !important;
  }

  ${darkFocusedExhibition} select,
  ${darkFocusedExhibition} input,
  ${darkFocusedExhibition} textarea {
    background-color: ${exhibitionColours.darkPanelSoft} !important;
    border-color: rgba(246, 241, 244, 0.18) !important;
    color: ${exhibitionColours.darkText} !important;
  }

  ${darkFocusedExhibition} a,
  ${darkFocusedExhibition} button {
    color: inherit;
  }

  ${darkFocusedExhibition} [role="menu"],
  ${darkFocusedExhibition} [class*="DropdownMenu"],
  ${darkFocusedExhibition} [class*="DropdownContent"] {
    background-color: ${exhibitionColours.darkPanelHeader} !important;
    color: ${exhibitionColours.darkText} !important;
    border-color: ${exhibitionColours.darkBorder} !important;
  }

  ${(props) =>
    props.$side === "left"
      ? css`
          left: 4.5rem;
          transform: translateX(${props.$open ? "0" : "-0.75rem"});
        `
      : css`
          right: 4.5rem;
          transform: translateX(${props.$open ? "0" : "0.75rem"});
        `}

  @media (max-width: 760px) {
    top: 4.25rem;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: auto !important;
    max-width: none;
    min-width: 0;
    transform: translateY(${(props) => (props.$open ? "0" : "0.75rem")});
  }
`;

export const FloatingPanelBody = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
`;
