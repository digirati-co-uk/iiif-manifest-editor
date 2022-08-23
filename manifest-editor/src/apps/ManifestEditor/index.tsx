import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { ManifestProperties } from "@/_panels/center-panels/ManifestProperties/ManifestProperties";
import { AnnotationContext, CanvasContext } from "react-iiif-vault";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";
import { LeftPanelMenu } from "./components/LeftPanelMenu";
import { NewAnnotationPage } from "./components/NewAnnotationPage";
import { CanvasMedia } from "@/resource-editors/canvas/CanvasMedia";
import { ServiceEditor } from "@/resource-editors/service/ServiceEditor";
import { CanvasThumbnailForm } from "@/editors/ThumbnailProperties/CanvasThumbnailForm";
import { ThumbnailPage } from "./components/ThumbnailPage";
import { CanvasList } from "@/_panels/left-panels/CanvasList/CanvasList";
import { RangeNavigation } from "@/_panels/left-panels/RangeNavigation/RangeNavigation";
import { CanvasVerticalThumbnails } from "@/_panels/left-panels/CanvasVerticalThumbnails/CanvasVerticalThumbnails";
import { CanvasThumbnailView } from "@/_panels/left-panels/CanvasThumbnailView/CanvasThumbnailView";
import { OutlineView } from "@/_panels/left-panels/OutlineView/OutlineView";
import { ThumbnailGridView } from "@/_panels/center-panels/ThumbnailGridView/ThumbnailGridView";
import { ManifestPropertiesList } from "@/_panels/center-panels/ManifestPropertiesList/ManifestPropertiesList";
import { CanvasProperties } from "@/_panels/right-panels/CanvasProperties/CanvasProperties";
import { CreatePaintingAnnotation } from "@/_panels/right-panels/CreatePaintingAnnotation/CreatePaintingAnnotation";

export default { id: "manifest-editor", title: "Manifest editor", project: true };

export const leftPanelMenu = <LeftPanelMenu />;

export const leftPanels: LayoutPanel[] = [
  {
    id: "thumbnail-view",
    label: "Canvases",
    defaultState: { width: 128 },
    render: (state, { actions }, ctx) => (
      <CanvasThumbnailView
        width={state.width}
        onCanvasClick={(canvasId) => {
          ctx.setState({ canvasId });
          actions.change("canvas-properties");
        }}
        onCanvasDoubleClick={(canvasId) => {
          ctx.setState({ canvasId });
          actions.open("canvas-properties");
        }}
      />
    ),
  },
  {
    id: "canvas-vertical-list",
    label: "Canvases",
    render: () => <CanvasVerticalThumbnails />,
  },
  {
    id: "outline-view",
    label: "Outline view",
    render: () => <OutlineView />,
  },
  {
    id: "canvas-list-view",
    label: "Canvas list view",
    render: () => <CanvasList />,
  },
  {
    id: "canvas-range-view",
    label: "Structure",
    render: () => <RangeNavigation />,
  },
];

export const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: (state, { actions }) => (
      <CanvasPanelViewer
        onEditAnnotation={(id) => {
          actions.stack("canvas-media", { annotation: id });
        }}
      />
    ),
  },
  {
    id: "thumbnail-grid",
    label: "Thumbnail grid",
    icon: "",
    render: (state, { actions }, ctx) => (
      <ThumbnailGridView
        canvasIds={state.canvasIds}
        clearCanvases={() => {
          actions.centerPanel.change({ id: "thumbnail-grid", state: { canvasIds: undefined } });
        }}
        onChangeCanvas={(canvasId, thumbnails) => {
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
    // backAction: (state, { actions }) => actions.open("canvas-properties"),
    render: (state: { current: number }, { actions }, app) => (
      <ManifestProperties
        current={state.current}
        setCurrent={(idx) => actions.change("manifest-properties", { current: idx })}
      />
    ),
  },
  {
    id: "manifest-properties-list",
    label: "Manifest properties (list)",
    render: () => {
      return <ManifestPropertiesList />;
    },
  },
  {
    id: "canvas-properties",
    label: "Canvas properties",
    defaultState: { current: 0 },
    options: { tabs: true, minWidth: 475 },
    // backAction: (state, { actions }) => actions.open("manifest-properties"),
    render: (state: { current: number }, { actions }, app) => (
      <CanvasProperties
        canvasId={app.state.canvasId}
        currentPanel={state.current}
        setCurrentPanel={(idx) => actions.change("canvas-properties", { current: idx })}
      />
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
    requiresState: true,
    render: (state: { annotation: string }, _, app) => (
      <AnnotationContext annotation={state.annotation}>
        <CanvasContext canvas={app.state.canvasId}>
          <CanvasMedia key={state.annotation} />
        </CanvasContext>
      </AnnotationContext>
    ),
  },
  {
    id: "new-manifest-thumbnail",
    label: "New manifest thumbnail",
    backAction: (state, { actions }) => actions.open("manifest-properties", { current: 0 }),
    render: () => {
      return <ThumbnailPage level={"manifest"} />;
    },
  },
  {
    id: "new-canvas-thumbnail",
    label: "New canvas thumbnail",
    backAction: (state, { actions }) => actions.open("canvas-properties", { current: 0 }),
    render: () => {
      return <ThumbnailPage level={"canvas"} />;
    },
  },
  {
    id: "service-editor",
    label: "Edit service",
    requiresState: true,
    render: (state) => {
      return <ServiceEditor id={state.service} resourceId={state.resourceId} />;
    },
  },
  {
    id: "canvas-thumbnail",
    label: "Edit canvas thumbnail",
    // @todo add prompt to add new if one does not exist and then remove this.
    requiresState: true,
    render: (state) => {
      return <CanvasThumbnailForm />;
    },
  },
  {
    id: "create-painting-annotation",
    label: "Add media item",
    render: (state, ctx, app) => (
      <CanvasContext canvas={app.state.canvasId}>
        <CreatePaintingAnnotation />,
      </CanvasContext>
    ),
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
