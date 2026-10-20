import type { Meta, StoryObj } from "@storybook/react-vite";
import { collectionPreset } from "@manifest-editor/collection-preset";
import { exhibitionEditorPreset } from "@manifest-editor/exhibition-preset";
import * as manifestPreset from "@manifest-editor/manifest-preset";
import { Layout, mapApp, type Config } from "@manifest-editor/shell";
import { useState } from "react";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { StoryFrame } from "../../support/StoryFrame";

const apps = { Manifest: mapApp(manifestPreset), Collection: collectionPreset, Exhibition: exhibitionEditorPreset };
type Args = { resource: string; preset: keyof typeof apps; layoutMode: "default" | "focused"; restricted: boolean };
function PresetStory({ resource, preset, layoutMode, restricted }: Args) {
  const [revision, reset] = useState(0);
  const config: Partial<Config> = {
    urlState: { getSearchParam: () => null, replaceSearchParam: () => {} },
    editorFeatureFlags: { rememberCanvasId: false, rememberLeftPanelId: false },
    ...(restricted
      ? {
          editorConfig: {
            Manifest: {
              fields: ["label", "summary", "requiredStatement"],
              singleTab: "@manifest-editor/overview",
              onlyTabs: ["@manifest-editor/overview"],
            },
          },
        }
      : {}),
  };
  return (
    <StoryFrame
      title={`${preset} preset`}
      summary={
        restricted
          ? "Focused layout with the Overview editor limited to label, summary and required statement. Changes stay in this story’s Vault."
          : "A complete editor using a remote IIIF resource. Changes stay in this story’s Vault."
      }
      source={resource}
      onReset={() => reset((n) => n + 1)}
    >
      <div className="sb-pane sb-editor" style={{ padding: 0 }}>
        <HeadlessEditor
          key={`${resource}-${preset}-${revision}`}
          resource={resource}
          app={apps[preset]}
          config={config}
        >
          <Layout layoutMode={layoutMode} />
        </HeadlessEditor>
      </div>
    </StoryFrame>
  );
}
const meta = {
  title: "Presets/Complete editor",
  component: PresetStory,
  args: { resource: resources.image, preset: "Manifest", layoutMode: "default", restricted: false },
  argTypes: {
    resource: { control: "text" },
    preset: { control: "select", options: Object.keys(apps) },
    layoutMode: { control: "inline-radio", options: ["default", "focused"] },
  },
} satisfies Meta<typeof PresetStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CookbookImage: Story = {};
export const MultipageBook: Story = { args: { resource: resources.book } };
export const Audio: Story = { args: { resource: resources.audio } };
export const Video: Story = { args: { resource: resources.video } };
export const DelftHeritageObject: Story = { args: { resource: resources.delftManifest } };
export const CookbookCollection: Story = { args: { resource: resources.collection, preset: "Collection" } };
export const DelftAcademicHeritage: Story = { args: { resource: resources.delftCollection, preset: "Collection" } };
export const Exhibition: Story = { args: { resource: resources.book, preset: "Exhibition" } };
export const FocusedAndRestricted: Story = {
  args: { resource: resources.book, layoutMode: "focused", restricted: true },
};
