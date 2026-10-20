import type { Meta, StoryObj } from "@storybook/react-vite";
import { CanvasThumbnailGridItem, ThumbnailGridContainer } from "@manifest-editor/components";
import { useState } from "react";
import { CanvasContext, LocaleString, useCanvas, useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function CanvasDetails() {
  const canvas = useCanvas();
  return (
    <div className="sb-json-wrapper">
      <LocaleString as="h2">{canvas?.label}</LocaleString>
      <JsonPanel
        title="Selected canvas"
        value={
          canvas
            ? { id: canvas.id, type: canvas.type, label: canvas.label, width: canvas.width, height: canvas.height }
            : null
        }
      />
    </div>
  );
}

function ThumbnailSelection({ hideLabel, size }: { hideLabel: boolean; size: "grid-sm" | "grid-md" | "grid-lg" }) {
  const manifest = useManifest();
  const [selected, setSelected] = useState<string>();
  const canvasId = selected || manifest?.items[0]?.id;
  if (!manifest?.items.length) return <p>No canvases in this manifest.</p>;
  return (
    <div className="sb-split">
      <div className="sb-pane">
        <ThumbnailGridContainer wide size={size}>
          {manifest.items.map((canvas) => (
            <CanvasThumbnailGridItem
              key={canvas.id}
              id={canvas.id}
              selected={canvas.id === canvasId}
              hideLabel={hideLabel}
              onClick={() => setSelected(canvas.id)}
            />
          ))}
        </ThumbnailGridContainer>
      </div>
      {canvasId ? (
        <CanvasContext canvas={canvasId}>
          <CanvasDetails />
        </CanvasContext>
      ) : null}
    </div>
  );
}

function Thumbnails({
  resource,
  hideLabel = false,
  size = "grid-sm",
}: {
  resource: string;
  hideLabel?: boolean;
  size?: "grid-sm" | "grid-md" | "grid-lg";
}) {
  const [version, setVersion] = useState(0);
  return (
    <StoryFrame
      title="Canvas thumbnails"
      summary="Real canvas thumbnails from a remote manifest. Choose a canvas to inspect its label and dimensions."
      source={resource}
      onReset={() => setVersion((v) => v + 1)}
    >
      <HeadlessEditor key={`${resource}-${version}`} resource={resource}>
        <ThumbnailSelection hideLabel={hideLabel} size={size} />
      </HeadlessEditor>
    </StoryFrame>
  );
}

const meta = {
  title: "Components with context/Canvas thumbnails",
  component: Thumbnails,
  args: { resource: resources.book, hideLabel: false, size: "grid-sm" },
  argTypes: {
    resource: { control: "select", options: [resources.book, resources.imageService, resources.delftManifest] },
    size: { control: "inline-radio", options: ["grid-sm", "grid-md", "grid-lg"] },
  },
} satisfies Meta<typeof Thumbnails>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ManifestCanvasSelection: Story = {};
