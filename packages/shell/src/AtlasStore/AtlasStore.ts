import type { Runtime, ViewerMode } from "@atlas-viewer/atlas";
import type { FragmentSelector, SvgSelector } from "@iiif/presentation-3";
import type { Emitter, Handler } from "mitt";
import {
  type InputShape,
  type RenderState,
  type SlowState,
  createHelper,
} from "polygon-editor";
import { createStore } from "zustand/vanilla";
import { polygonToBoundingBox } from "./polygon-to-bounding-box";

type Polygons = ReturnType<typeof createHelper>;
type Point =
  | [number, number]
  | [number, number, number, number, number, number];

export type AnnotationRequest =
  | {
      type: "polygon";
      points?: Array<Point>;
      open?: boolean;
    }
  | {
      type: "target";
      selector: null | { x: number; y: number; width: number; height: number };
    }
  | {
      type: "box";
      selector: null | { x: number; y: number; width: number; height: number };
    };

export type AnnotationRequestOptions = {
  requestId: string;
  canvasId?: string | null;
  toolId?: keyof AtlasStore["switchTool"];
};

export interface AtlasStore {
  mode: ViewerMode;
  tool: {
    enabled: boolean;
    requestId: string | null;
    canvasId: string | null;
  };
  requestType: null | "polygon" | "target" | "box";

  switchTool: {
    draw(): void;
    polygon(): void;
    line(): void;
    lineBox(): void;
    square(): void;
    triangle(): void;
    hexagon(): void;
    circle(): void;
    remove(): void;
  };

  history: {
    canUndo: boolean;
    canRedo: boolean;
    undo(): void;
    redo(): void;
  };

  stableViewport: null | {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };

  canvasRelativePositions: Record<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  >;

  canvasViewports: Record<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
      zoom: number;
    }
  >;

  validRequestIds: string[];

  polygon: InputShape | null;
  polygons: Polygons;
  polygonState: SlowState;
  setPolygonState: (
    state: SlowState | ((prev: SlowState) => SlowState),
  ) => void;
  setToolCanvasId: (canvasId: string) => void;

  getRequestId(): { requestId: string; clear: () => void };
  requestAnnotation(
    req: AnnotationRequest,
    options: AnnotationRequestOptions,
  ): Promise<AnnotationResponse | null>;
  setAtlasRuntime(runtime: Runtime): void;
  setCanvasRelativePosition(
    canvasId: string,
    position: { x: number; y: number; width: number; height: number },
  ): void;
  clearCanvasRelativePosition(canvasId: string): void;
  clearAtlasRuntime(): void;
  completeRequest(): void;
  cancelRequest(requestId: string): void;
  reset(): void;

  // Controls.
  changeMode(mode: ViewerMode): void;
  nudgeLeft(): void;
  nudgeRight(): void;
  nudgeUp(): void;
  nudgeDown(): void;
  zoomIn(): void;
  zoomOut(): void;
  goHome(): void;
}

function polygonToTarget(
  polygon: InputShape,
): FragmentSelector | SvgSelector | null {
  if (!polygon) return null;

  // // Check if its a rectangle.
  // if (polygon.points.length === 4) {
  // 	const [p1, p2, p3, p4] = polygon.points as [
  // 		[number, number],
  // 		[number, number],
  // 		[number, number],
  // 		[number, number],
  // 	];
  // 	if (
  // 		p1[0] === p2[0] &&
  // 		p2[1] === p3[1] &&
  // 		p3[0] === p4[0] &&
  // 		p4[1] === p1[1]
  // 	) {
  // 		const bb = polygonToBoundingBox(polygon);
  // 		if (bb) {
  // 			return {
  // 				type: "FragmentSelector",
  // 				value: `#xywh=${bb.x},${bb.y},${bb.width},${bb.height}`,
  // 			};
  // 		}
  // 	}
  // }

  return {
    type: "SvgSelector",
    value: `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><path d='M${polygon.points
      .map((p) => p.join(","))
      .join(" ")}${polygon.open ? "" : " Z"}' /></g></svg>`,
  };
}

export function requestToAnnotationResponse(
  request: AnnotationRequest,
): Omit<AnnotationResponse, "id"> {
  if (request.type === "polygon") {
    return {
      polygon: {
        points: request.points || [],
        open: request.open || false,
      },
      requestType: "polygon",
      boundingBox: polygonToBoundingBox({
        points: request.points || [],
        open: false,
      }),
      target: polygonToTarget({ points: request.points || [], open: false }),
    };
  }

  const box = request.selector;
  if (box) {
    const points = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x + box.width, box.y + box.height],
      [box.x, box.y + box.height],
    ] as Array<Point>;
    return {
      polygon: {
        points,
        open: false,
      },
      requestType: request.type,
      boundingBox: box,
      target: polygonToTarget({ points, open: false }),
    };
  }

  return {
    polygon: { points: [] as Array<Point>, open: false },
    requestType: request.type,
    boundingBox: null,
    target: null,
  };
}

export type AnnotationResponse = {
  id: string;
  canvasId?: string | null;
  polygon: InputShape | null;
  requestType: "polygon" | "target" | "box";
  target: FragmentSelector | SvgSelector | null;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
};

export type AtlasStoreEvents = {
  "atlas.canvas-click": {
    canvasId: string;
    target: { x: number; y: number };
    worldTarget: { x: number; y: number };
  };
  "atlas.viewport-change": {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
  "atlas.ready": { runtime: Runtime };
  "atlas.annotation-completed": AnnotationResponse;
  "atlas.annotation-request": { id: string };
  "atlas.request-cancelled": { id: string };
  "atlas.polygon-render": {
    state: RenderState;
    slowState: SlowState;
    dt: number;
  };
};

interface CreateAtlasStoreProps {
  events: Emitter<AtlasStoreEvents>;
}

const defaultSlowState: SlowState = {
  shapeId: null,
  noShape: true,
  transitioning: false,
  actionIntentType: null,
  transitionIntentType: null,
  selectedPoints: [],
  hasClosestLine: false,
  modifiers: {
    Alt: false,
    Shift: false,
    Meta: false,
    proximity: 0, // default value.
  },
  showBoundingBox: false,
  currentModifiers: {},
  validIntentKeys: {},
  pointerInsideShape: false,
  closestPoint: null,
  transitionModifiers: null,
  selectedStamp: null,
  lineMode: false,
  lineBoxMode: false,
  drawMode: false,
  bezierLines: [],
  boxMode: false,
  fixedAspectRatio: false,
};

export function createAtlasStore({ events }: CreateAtlasStoreProps) {
  const store = createStore<AtlasStore>((set, get) => {
    let runtime: Runtime | null = null;

    const onSave = (input: {
      id?: string;
      open: boolean;
      points: Array<Point>;
    }) => {
      set((s) =>
        s.tool.requestId
          ? { polygon: { ...input, id: s.tool.requestId } }
          : {
              polygon: { id: undefined, points: [], open: true },
            },
      );
    };
    const polygons = createHelper(null, onSave);

    return {
      mode: "explore",
      tool: {
        enabled: false,
        requestId: null,
        canvasId: null,
      },
      requestType: null,

      history: polygons.history,

      polygon: null,

      validRequestIds: [],

      stableViewport: null,
      canvasRelativePositions: {},
      canvasViewports: {},

      polygons: polygons,
      polygonState: defaultSlowState,

      setToolCanvasId: (canvasId) => {
        set((state) => ({ tool: { ...state.tool, canvasId } }));
      },

      switchTool: {
        draw() {
          set({ mode: "sketch" });
          helper.stamps.clear();
          helper.draw.enable();
        },
        polygon() {
          set({ mode: "sketch" });
          helper.stamps.clear();
          helper.draw.disable();
          helper.modes.disableLineBoxMode();
          helper.modes.disableLineMode();
        },
        line() {
          set({ mode: "sketch" });
          helper.modes.enableLineMode();
        },
        lineBox() {
          set({ mode: "sketch" });
          helper.modes.enableLineBoxMode();
        },
        square() {
          set({ mode: "sketch" });
          helper.stamps.square();
        },
        triangle() {
          set({ mode: "sketch" });
          helper.stamps.triangle();
        },
        hexagon() {
          set({ mode: "sketch" });
          helper.stamps.hexagon();
        },
        circle() {
          set({ mode: "sketch" });
          helper.stamps.circle();
        },
        remove() {
          helper.key.down("Backspace");
        },
      },

      reset: () => {
        const state = get();
        if (state.tool.requestId) {
          state.cancelRequest(state.tool.requestId);
        }
      },

      setPolygonState: (state) =>
        set({
          polygonState:
            typeof state === "function" ? state(get().polygonState) : state,
        }),

      getRequestId: () => {
        const requestId = Math.random().toString(36).slice(2);
        set((state) => ({
          validRequestIds: [...state.validRequestIds, requestId],
        }));
        return {
          requestId,
          clear: () => {
            if (get().tool.requestId === requestId) {
              // dispatch event to cancel.
            }
            set((state) => ({
              tool:
                state.tool.requestId === requestId
                  ? { enabled: false, requestId: null, canvasId: null }
                  : state.tool,
              validRequestIds: state.validRequestIds.filter(
                (id) => id !== requestId,
              ),
            }));
          },
        };
      },

      cancelRequest: (requestId) => {
        set((state) => ({
          mode: "explore",
          tool:
            state.tool.requestId === requestId
              ? { enabled: false, requestId: null, canvasId: null }
              : state.tool,
          validRequestIds: state.validRequestIds.filter(
            (id) => id !== requestId,
          ),
        }));

        events.emit("atlas.request-cancelled", { id: requestId });
      },

      requestAnnotation: async (request, options) => {
        const response = requestToAnnotationResponse(request);
        try {
          const { points = [], open = true } = response.polygon || {};
          const { requestId, canvasId = null, toolId } = options;

          const state = get();
          const isValid = state.validRequestIds.includes(requestId);

          if (!isValid) return null;
          if (state.tool.enabled) return null;
          polygons.setShape({ id: requestId, points, open });
          if (request.type === "box") {
            polygons.modes.enableBoxMode();
          }
          if (request.type === "target") {
            polygons.modes.enableBoxMode();
            polygons.modes.lockAspectRatio();
          }
          events.emit("atlas.annotation-request", { id: requestId });
          set({
            polygon: { id: requestId, points, open },
            mode: "sketch",
            requestType: request.type,
            tool: {
              enabled: true,
              requestId,
              canvasId,
            },
          });
          if (toolId) {
            state.switchTool[toolId]?.();
          } else if (points.length === 0) {
            // Default to square.
            state.switchTool.square();
          }

          return new Promise<AnnotationResponse | null>((resolve) => {
            const cancelHandler: Handler<
              AtlasStoreEvents["atlas.request-cancelled"]
            > = (e) => {
              if (e.id !== requestId) return;
              set({
                mode: "explore",
                tool: {
                  requestId: null,
                  enabled: false,
                  canvasId: null,
                },
              });
              events.off("atlas.request-cancelled", cancelHandler);
              events.off("atlas.annotation-completed", handler);
              resolve(null);
            };

            const handler: Handler<
              AtlasStoreEvents["atlas.annotation-completed"]
            > = (e) => {
              if (e.id !== requestId) return;
              set({
                mode: "explore",
                tool: {
                  requestId: null,
                  enabled: false,
                  canvasId: null,
                },
              });
              events.off("atlas.annotation-completed", handler);
              events.off("atlas.request-cancelled", cancelHandler);
              resolve(e);
            };
            events.on("atlas.request-cancelled", cancelHandler);
            events.on("atlas.annotation-completed", handler);
          });
        } catch (err) {
          return null;
        }
      },

      completeRequest: () => {
        const polygon = get().polygon;
        if (!polygon) return;
        events.emit("atlas.annotation-completed", {
          id: polygon.id!,
          polygon,
          requestType: get().requestType as any,
          target: polygonToTarget(polygon),
          canvasId: get().tool.canvasId,
          boundingBox: polygonToBoundingBox(polygon),
        });
      },

      setAtlasRuntime: (newRuntime: Runtime) => {
        runtime = newRuntime;
        events.emit("atlas.ready", { runtime: newRuntime });

        runtime.world.addLayoutSubscriber((ev, data) => {
          if (
            ev === "event-activation" ||
            ev === "zoom-to" ||
            ev === "go-home"
          ) {
            if (
              runtime?._lastGoodScale &&
              !Number.isNaN(runtime._lastGoodScale)
            ) {
              helper.setScale(1 / runtime._lastGoodScale);
            }
          }
        });

        // @todo set up events etc.
      },

      clearAtlasRuntime: () => {
        runtime = null;
        set({ stableViewport: null });
      },

      setCanvasRelativePosition: (canvasId: string, position) => {
        set((state) => ({
          canvasRelativePositions: {
            ...state.canvasRelativePositions,
            [canvasId]: position,
          },
        }));
      },

      clearCanvasRelativePosition: (canvasId: string) => {
        set((state) => {
          const newPositions = { ...state.canvasRelativePositions };
          delete newPositions[canvasId];
          return { canvasRelativePositions: newPositions };
        });
      },

      changeMode: (mode) => {
        set({ mode });
      },

      // Navigation controls
      nudgeLeft: () => {
        // @todo
      },

      nudgeRight: () => {
        // @todo
      },

      nudgeUp: () => {
        // @todo
      },

      nudgeDown: () => {
        // @todo
      },

      zoomIn: () => {
        runtime?.world?.zoomIn();
      },

      zoomOut: () => {
        runtime?.world?.zoomOut();
      },

      goHome: () => {
        runtime?.world?.goHome();
      },
    };
  });

  // Reset when sequence changes.
  // events.on("sequence.change", () => {
  //   store.getState().reset();
  // });

  const helper = store.getState().polygons;
  events.on("atlas.annotation-request", () => {
    helper.clock.start((state, slowState, dt) => {
      events.emit("atlas.polygon-render", { state, slowState, dt });
    }, store.getState().setPolygonState);
  });

  events.on("atlas.annotation-completed", () => {
    helper.clock.stop();
  });

  events.on("atlas.request-cancelled", () => {
    helper.clock.stop();
  });

  return store;
}
