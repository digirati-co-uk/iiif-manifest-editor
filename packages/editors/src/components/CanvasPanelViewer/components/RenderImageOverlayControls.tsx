import { HTMLPortal } from "@atlas-viewer/atlas";
import { ActionButton } from "@manifest-editor/components";
import { useEditingResource, useEditingStack, useLayoutActions } from "@manifest-editor/shell";
import { type SVGProps, useState } from "react";
import { useCanvas, useContextMenuStore, useCurrentAnnotationRequest, useStrategy } from "react-iiif-vault";

export function RenderImageOverlayControls() {
  const { strategy } = useStrategy();
  const canvas = useCanvas();
  const request = useCurrentAnnotationRequest();
  const [selected, setSelected] = useState<string | null>(null);

  if (strategy.type !== "images" || request) {
    return null;
  }

  const images = strategy.images || [];

  return (
    <>
      {images.map((image) => {
        const target = image.target.spatial;
        return (
          <SingleImageOverlay
            key={image.id}
            id={image.annotationId}
            target={target}
            selected={selected === image.id}
            onSelect={() => setSelected(image.id)}
          />
        );
      })}
      <world-object
        width={canvas.width}
        height={canvas.height}
        onClick={() => {
          setSelected(null);
        }}
      />
    </>
  );
}

function SingleImageOverlay(props: {
  id: string;
  target: { x: number; y: number; width: number; height: number };
  selected: boolean;
  onSelect: () => void;
}) {
  const { edit } = useLayoutActions();
  const resource = useEditingResource();
  const resourceId = resource?.resource.source?.id;
  const { target } = props;
  const store = useContextMenuStore();
  const isSelected = resourceId === props.id;

  return (
    <world-object
      id={`overlay-wo/${props.id}`}
      x={target.x}
      y={target.y}
      width={target.width}
      height={target.height}
      onClick={(e) => {
        e.stopPropagation();
        props.onSelect();
      }}
    >
      <HTMLPortal target={{ x: 0, y: 0, width: props.target.width, height: 10 }} relative={true} interactive={true}>
        {props.selected ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: "translateY(-2em)",
              gap: "0.35em",
            }}
          >
            <ActionButton isDisabled={isSelected} onPress={() => edit({ id: props.id, type: "Annotation" })}>
              Edit
            </ActionButton>
            <ActionButton
              onPress={(e) => {
                store.toggle({
                  x: target.x + props.target.width / 2,
                  y: target.y + 1,
                });
              }}
            >
              <MoreIcon className="text-xl" />
            </ActionButton>
          </div>
        ) : null}
      </HTMLPortal>
    </world-object>
  );
}

export function ResizeHandleIcon({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1em" width="1em" {...props}>
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z" />
      {title ? <title>{title}</title> : null}
    </svg>
  );
}

export function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m12 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-6 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"
      />
    </svg>
  );
}
