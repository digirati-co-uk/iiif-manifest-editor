import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Layout, useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { StoryFrame } from "../../support/StoryFrame";

type Workflow = "ranges" | "chapters" | "annotations";

function OpenWorkflow({ workflow }: { workflow: Workflow }) {
  const actions = useLayoutActions();
  const manifest = useManifest();
  const manifestId = manifest?.id;
  const rangeId = manifest?.structures?.[0]?.id;
  const canvasId = manifest?.items[0]?.id;
  useEffect(() => {
    if (!manifestId) return;
    if (workflow === "ranges") {
      if (rangeId) actions.edit({ id: rangeId, type: "Range" }, undefined, { reset: true });
      actions.leftPanel.open({ id: "@manifest-editor/ranges-listing" });
      actions.centerPanel.open({ id: "range-workbench" });
    } else if (workflow === "chapters") {
      actions.leftPanel.open({ id: "@manifest-editor/av-ranges-listing" });
    } else {
      if (canvasId) actions.edit({ id: canvasId, type: "Canvas" }, undefined, { reset: true });
      actions.centerPanel.open({ id: "current-canvas" });
      actions.leftPanel.open({ id: "@manifest-editor/canvas-annotation-listing" });
    }
  }, [actions, manifestId, rangeId, canvasId, workflow]);
  return <Layout />;
}

function WorkflowStory({ resource, workflow }: { resource: string; workflow: Workflow }) {
  const [revision, reset] = useState(0);
  return (
    <StoryFrame
      title={
        workflow === "chapters"
          ? "A/V chapter workbench"
          : workflow === "ranges"
            ? "Range workbench"
            : "Canvas annotations"
      }
      summary="The complete manifest preset opens directly in this workflow, using remote content and real plugin panels. Reset discards local edits."
      source={resource}
      onReset={() => reset((n) => n + 1)}
    >
      <div className="sb-pane sb-editor">
        <HeadlessEditor
          key={`${resource}-${workflow}-${revision}`}
          resource={resource}
          config={{ plugins: { apps: { "manifest-editor": { enabled: ["@manifest-editor/av-ranges"] } } } }}
        >
          <OpenWorkflow workflow={workflow} />
        </HeadlessEditor>
      </div>
    </StoryFrame>
  );
}

const meta = {
  title: "Presets/Workflows",
  component: WorkflowStory,
  args: { resource: resources.book, workflow: "ranges" },
  argTypes: {
    resource: { control: "text" },
    workflow: { control: "select", options: ["ranges", "chapters", "annotations"] },
  },
} satisfies Meta<typeof WorkflowStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BookTableOfContents: Story = {
  args: { resource: "https://iiif.io/api/cookbook/recipe/0024-book-4-toc/manifest.json" },
};
export const AudioChapters: Story = {
  args: { resource: resources.audio, workflow: "chapters" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Mark in" }));
    await userEvent.click(canvas.getByRole("button", { name: "+5s" }));
    await userEvent.click(canvas.getByRole("button", { name: "Mark out" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Create" }));
    const title = await page.findByRole("textbox", { name: "Title" });
    await userEvent.clear(title);
    await userEvent.type(title, "Opening five seconds");
    await userEvent.click(page.getByRole("button", { name: "Create range" }));
    await canvas.findAllByText("Opening five seconds");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await canvas.findByText(/Create the first range/);
    await waitFor(() => expect(canvas.queryByText("Opening five seconds")).toBeNull());
  },
};
export const VideoTableOfContents: Story = {
  args: { resource: "https://iiif.io/api/cookbook/recipe/0026-toc-opera/manifest.json", workflow: "chapters" },
};
export const CreateCanvasAnnotations: Story = {
  args: { resource: resources.imageService, workflow: "annotations" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Create empty page" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Create empty page" })).toBeNull());
    await canvas.findAllByRole("button", { name: "Add annotation" });
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await canvas.findByRole("button", { name: "Create empty page" });
  },
};
export const ExistingCanvasAnnotations: Story = {
  args: {
    resource: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json",
    workflow: "annotations",
  },
};
