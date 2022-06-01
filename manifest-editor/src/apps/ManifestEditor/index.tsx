import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ManifestForm } from "../../editors/ManifestProperties/ManifestForm";
import { CanvasForm } from "../../editors/CanvasProperties/CanvasForm";
import { AnnotationContext, CanvasContext } from "react-iiif-vault";
import { CanvasPanelViewer } from "../../components/viewers/CanvasPanelViewer/CanvasPanelViewer";
import { LeftPanelMenu } from "./components/LeftPanelMenu";
import { NewAnnotationPage } from "./components/NewAnnotationPage";
import { GridView } from "../../components/organisms/GridView/GridView";
import { CanvasMedia } from "../../resource-editors/canvas/CanvasMedia";
import { ServiceEditor } from "../../resource-editors/service/ServiceEditor";
import { ThumbnailPage } from "./components/ThumbnailPage";
import { limitation } from "../../helpers/limitation";
import { PanelError } from "../../shell/Layout/components/PanelError";

export default { id: "manifest-editor", title: "Manifest editor", project: true };

export const leftPanelMenu = <LeftPanelMenu />;

export const leftPanels: LayoutPanel[] = [
  {
    id: "thumbnail-view",
    label: "Canvases",
    defaultState: { width: 128 },
    render: (state, { actions }, ctx) => {
      return (
        <GridView
          strip={true}
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
    render: () => <OutlinePlaceholder />,
  },
];

function OutlinePlaceholder() {
  limitation(false, "Outline view feature is not yet complete");

  return null;
}

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
    label: "Add new media",
    backAction: (state, { actions }) => actions.open("canvas-properties", { current: 2 }),
    render: () => <NewAnnotationPage />,
  },
  {
    id: "canvas-media",
    label: "Edit media item",
    render: (state: { annotation: string }, _, app) => (
      <AnnotationContext annotation={state.annotation}>
        <CanvasContext canvas={app.state.canvasId}>
          <CanvasMedia />
        </CanvasContext>
      </AnnotationContext>
    ),
  },
  {
    id: "new-manifest-thumbnail",
    label: "Create new thumbnail",
    backAction: (state, { actions }) => actions.open("manifest-properties", { current: 0 }),
    render: () => {
      return <ThumbnailPage level={"manifest"} />;
    },
  },
  {
    id: "new-canvas-thumbnail",
    label: "Create new thumbnail",
    backAction: (state, { actions }) => actions.open("canvas-properties", { current: 0 }),
    render: () => {
      return <ThumbnailPage level={"canvas"} />;
    },
  },
  {
    id: "service-editor",
    label: "Edit service",
    render: (state) => {
      return <ServiceEditor id={state.service} resourceId={state.resourceId} />;
    },
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
