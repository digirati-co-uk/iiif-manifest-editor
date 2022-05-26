import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ManifestForm } from "../../editors/ManifestProperties/ManifestForm";
import { ThumbnailStrip } from "../../components/organisms/ThumbnailStrip";
import { CanvasForm } from "../../editors/CanvasProperties/CanvasForm";
import { CanvasContext } from "react-iiif-vault";
import { CanvasPanelViewer } from "../../components/viewers/CanvasPanelViewer/CanvasPanelViewer";
import { LeftPanelMenu } from "./components/LeftPanelMenu";
import { GridView } from "../../components/organisms/GridView";
import { NewAnnotationPage } from "./components/NewAnnotationPage";

export default { id: "manifest-editor-layouts", title: "Manifest editor (layout)", project: true };

export const leftPanelMenu = <LeftPanelMenu />;

export const leftPanels: LayoutPanel[] = [
  {
    id: "thumbnail-view",
    label: "Thumbnail strip",
    defaultState: { width: 128 },
    render: (state, { actions }, ctx) => {
      return (
        <ThumbnailStrip
          width={state.width}
          handleChange={(canvasId) => {
            ctx.setState({ canvasId });
            actions.open("canvas-properties");
          }}
        />
      );
    },
  },
  {
    id: "outline-view",
    label: "Outline view",
    render() {
      return <div>Outline view</div>;
    },
  },
];

export const centerPanels: LayoutPanel[] = [
  // CanvasPanel
  // Thumbnails
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: () => <CanvasPanelViewer />,
  },
  {
    id: "thumbnail-grid",
    label: "Thumbnail grid",
    icon: "",
    render: (state, { actions }, ctx) => (
      <GridView
        handleChange={(canvasId, thumbnails) => {
          ctx.setState({ canvasId });
          actions.open("canvas-properties");
          if (thumbnails) {
            actions.open("current-canvas");
          }
        }}
      />
    ),
  },
];

export const rightPanels: LayoutPanel[] = [
  {
    id: "manifest-properties",
    label: "Manifest properties",
    defaultState: { current: 0 },
    options: { tabs: true, minWidth: 400 },
    backAction: (state, { actions }) => actions.open("canvas-properties"),
    render: (state: { current: number }, { actions }, app) => (
      <ManifestForm
        current={state.current}
        setCurrent={(idx) => actions.change("manifest-properties", { current: idx })}
      />
    ),
  },
  {
    id: "canvas-properties",
    label: "Canvas properties",
    defaultState: { current: 0 },
    options: { tabs: true, minWidth: 450 },
    backAction: (state, { actions }) => actions.open("manifest-properties"),
    render: (state: { current: number }, { actions }, app) => (
      <CanvasContext canvas={app.state.canvasId}>
        <CanvasForm
          current={state.current}
          setCurrent={(idx) => actions.change("canvas-properties", { current: idx })}
        />
      </CanvasContext>
    ),
  },
  {
    id: "new-annotation-page",
    label: "Create new annotation page",
    render: () => <NewAnnotationPage />,
  },
  // {
  //   id: "media-properties",
  //   label: "Canvas media properties",
  //   render: () => {
  //     return <MediaForm />;
  //   },
  // },
  // <MediaForm />
  // <CanvasThumbnailForm />
  // <ManifestThumbnailForm />
];
