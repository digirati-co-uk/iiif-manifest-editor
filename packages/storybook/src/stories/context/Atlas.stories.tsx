import type { Meta, StoryObj } from "@storybook/react-vite";
import { CanvasPanelEditor, useInStack } from "@manifest-editor/editors";
import { useLayoutActions } from "@manifest-editor/shell";
import { getValue } from "@iiif/helpers";
import { useId, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { StoryFrame } from "../../support/StoryFrame";

function Viewer({ height }: { height?: number }) {
  const id = useId();
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const { edit } = useLayoutActions();
  if (!manifest?.items.length) return <p>No canvases in this manifest.</p>;
  return (
    <div className="sb-pane sb-atlas">
      <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 8, height: 32, padding: "0 8px" }}>
        <label htmlFor={id}>Canvas </label>
        <select
          id={id}
          value={canvas?.resource.source.id || manifest.items[0]?.id}
          onChange={(event) => edit({ id: event.target.value, type: "Canvas" }, undefined, { forceOpen: false })}
        >
          {manifest.items.map((item, index) => (
            <option key={item.id} value={item.id}>{`Canvas ${index + 1}`}</option>
          ))}
        </select>
        <span>{getValue(manifest.label)}</span>
      </div>
      <div
        style={{
          display: "flex",
          flex: height ? "0 0 auto" : 1,
          minHeight: 0,
          position: "relative",
          height,
          overflow: "hidden",
        }}
      >
        <CanvasPanelEditor />
      </div>
    </div>
  );
}

function AtlasExample({ resource, height }: { resource: string; height?: number }) {
  const [version, setVersion] = useState(0);
  return (
    <StoryFrame
      title="Atlas viewer"
      summary="The editor's Atlas canvas viewer inside the headless shell. Pan, zoom and select a canvas; Reset reloads a fresh session."
      source={resource}
      onReset={() => setVersion((v) => v + 1)}
    >
      <HeadlessEditor key={`${resource}-${version}`} resource={resource}>
        <Viewer height={height} />
      </HeadlessEditor>
    </StoryFrame>
  );
}

const meta = {
  title: "Components with context/Atlas",
  component: AtlasExample,
  args: { resource: resources.imageService },
  argTypes: {
    resource: { control: "select", options: [resources.imageService, resources.book, resources.delftManifest] },
    height: { control: { type: "range", min: 320, max: 900, step: 20 } },
  },
} satisfies Meta<typeof AtlasExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CookbookImageService: Story = {};
export const DelftHeritage: Story = { args: { resource: resources.delftManifest } };
