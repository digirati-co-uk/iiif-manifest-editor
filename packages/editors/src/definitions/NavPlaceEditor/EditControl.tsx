import { useLeafletContext } from "@react-leaflet/core";
import * as L from "leaflet";
import "leaflet-draw";
import React, { useEffect, useMemo, useRef } from "react";

type DrawControl = L.Control & {
  remove: () => void;
};

type DrawEvent = L.LeafletEvent & {
  layer?: L.Layer;
};

type DrawOptions = Record<string, unknown>;

export type EditControlProps = {
  position?: L.ControlPosition;
  draw?: DrawOptions;
  edit?: DrawOptions;
  onMounted?: (control: DrawControl) => void;
  onCreated?: (event: DrawEvent) => void;
  onEdited?: (event: DrawEvent) => void;
  onDeleted?: (event: DrawEvent) => void;
  onDrawStart?: (event: DrawEvent) => void;
  onDrawStop?: (event: DrawEvent) => void;
  onDrawVertex?: (event: DrawEvent) => void;
  onEditStart?: (event: DrawEvent) => void;
  onEditMove?: (event: DrawEvent) => void;
  onEditResize?: (event: DrawEvent) => void;
  onEditVertex?: (event: DrawEvent) => void;
  onEditStop?: (event: DrawEvent) => void;
  onDeleteStart?: (event: DrawEvent) => void;
  onDeleteStop?: (event: DrawEvent) => void;
};

const eventHandlers = {
  onEdited: "draw:edited",
  onDrawStart: "draw:drawstart",
  onDrawStop: "draw:drawstop",
  onDrawVertex: "draw:drawvertex",
  onEditStart: "draw:editstart",
  onEditMove: "draw:editmove",
  onEditResize: "draw:editresize",
  onEditVertex: "draw:editvertex",
  onEditStop: "draw:editstop",
  onDeleted: "draw:deleted",
  onDeleteStart: "draw:deletestart",
  onDeleteStop: "draw:deletestop",
} satisfies Record<string, string>;

export function EditControl(props: EditControlProps) {
  const context = useLeafletContext();
  const controlRef = useRef<DrawControl | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const controlOptions = useMemo(
    () => ({
      draw: props.draw,
      edit: props.edit,
      position: props.position,
    }),
    [props.draw, props.edit, props.position],
  );

  useEffect(() => {
    const map = context.map;
    const layerContainer = context.layerContainer || context.map;
    const onDrawCreate = (event: DrawEvent) => {
      if (event.layer) {
        layerContainer.addLayer(event.layer);
      }
      propsRef.current.onCreated?.(event);
    };
    const registeredHandlers: Array<[string, (event: DrawEvent) => void]> = [];

    for (const [propName, eventName] of Object.entries(eventHandlers)) {
      const handler = (event: DrawEvent) => {
        const current = propsRef.current[
          propName as keyof EditControlProps
        ] as ((event: DrawEvent) => void) | undefined;
        current?.(event);
      };
      registeredHandlers.push([eventName, handler]);
      map.on(eventName, handler);
    }

    map.on(getCreatedEventName(), onDrawCreate);
    controlRef.current = createDrawControl(propsRef.current, context);
    map.addControl(controlRef.current);
    propsRef.current.onMounted?.(controlRef.current);

    return () => {
      map.off(getCreatedEventName(), onDrawCreate);
      for (const [eventName, handler] of registeredHandlers) {
        map.off(eventName, handler);
      }
      controlRef.current?.remove();
      controlRef.current = null;
    };
  }, [context, controlOptions]);

  return null;
}

function createDrawControl(
  props: EditControlProps,
  context: ReturnType<typeof useLeafletContext>,
): DrawControl {
  const ControlDraw = (L.Control as any).Draw;
  const options: Record<string, unknown> = {
    edit: {
      ...(props.edit || {}),
      featureGroup: context.layerContainer,
    },
  };

  if (props.draw) {
    options.draw = { ...props.draw };
  }

  if (props.position) {
    options.position = props.position;
  }

  return new ControlDraw(options) as DrawControl;
}

function getCreatedEventName() {
  return ((L as any).Draw?.Event?.CREATED || "draw:created") as string;
}
