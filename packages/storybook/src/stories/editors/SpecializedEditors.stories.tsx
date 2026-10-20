import { allEditors, fallbackAnnotationEditor } from "@manifest-editor/editors";
import * as manifestPreset from "@manifest-editor/manifest-preset";
import { mapApp } from "@manifest-editor/shell";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EditorWorkbench } from "../../support/EditorWorkbench";
import { resources } from "../../support/resources";

const cookbook = "https://iiif.io/api/cookbook/recipe/";
const sources = {
  choice: `${cookbook}0033-choice/manifest.json`,
  composition: `${cookbook}0036-composition-from-multiple-images/manifest.json`,
  html: `${cookbook}0019-html-in-annotations/manifest.json`,
  ranges: `${cookbook}0024-book-4-toc/manifest.json`,
  geo: `${cookbook}0154-geo-extension/manifest.json`,
  annotation: `${cookbook}0266-full-canvas-annotation/manifest.json`,
  volume: `${cookbook}0030-multi-volume/manifest_v1.json`,
};

// The production preset intentionally omits the fallback editor. Opt it in only for its explicit story.
const fallbackApp = mapApp({ ...manifestPreset, editors: [...allEditors, fallbackAnnotationEditor] });
const referenceApp = mapApp({
  ...manifestPreset,
  resources: [...manifestPreset.resources, "Collection"],
});

const meta = {
  title: "Editors/Specialized panels",
  component: EditorWorkbench,
  args: {
    title: "Image resource",
    summary:
      "Edit the original image body from the Cookbook's simplest Manifest. Width, height and format changes serialize back to this image resource.",
    resource: resources.image,
    target: "paintingBody",
    selectedTab: "@manifest-editor/image-editor",
    showViewer: false,
  },
  argTypes: {
    resource: { control: "text" },
    target: {
      control: "select",
      options: [
        "manifest",
        "canvas",
        "paintingAnnotation",
        "paintingBody",
        "annotationPage",
        "annotation",
        "range",
        "nestedRange",
        "partOf",
      ],
    },
    app: { control: false, table: { disable: true } },
    config: { control: "object" },
    showViewer: {
      control: "boolean",
      description: "Adds the production Canvas viewer, including annotation drawing tools.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "These stories select nested resources from real remote Manifests and open their actual production editor. The original parent and property are supplied to the editing stack. Reset reloads the remote source into a fresh Vault. The partOf story explicitly adds one inverse collection reference; all other source data remains as published.",
      },
    },
  },
} satisfies Meta<typeof EditorWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ImageResource: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const format = await canvas.findByRole("textbox", { name: /^Format$/ }, { timeout: 30000 });
    await userEvent.clear(format);
    await userEvent.type(format, "image/webp");
    await waitFor(() =>
      expect(
        JSON.parse(
          canvas.getByRole("complementary", { name: "Live resource JSON" }).querySelector("code")!.textContent!
        ).format
      ).toBe("image/webp")
    );
    await userEvent.click(canvas.getByRole("button", { name: /^Reset$/ }));
    await expect(await canvas.findByRole("textbox", { name: /^Format$/ }, { timeout: 30000 })).toHaveValue("image/png");
  },
};

export const ImageServiceResource: Story = {
  args: {
    title: "Image resource with a IIIF service",
    summary:
      "The image editor uses the real Cookbook image-service body and thumbnail. Image dimensions and format remain editable; the source service is preserved in the JSON.",
    resource: resources.imageService,
  },
};

export const ImagePaintingAnnotation: Story = {
  args: {
    title: "Image painting annotation",
    summary:
      "The Media editor operates on the painting annotation, its image body, image-service information and target. Edit the body format or dimensions and inspect the complete annotation JSON.",
    resource: resources.imageService,
    target: "paintingAnnotation",
    selectedTab: "@manifest-editor/media-editor",
  },
};

export const AudioPaintingAnnotation: Story = {
  args: {
    title: "Audio painting annotation",
    summary:
      "Edit the Cookbook audio annotation and Sound body: descriptive fields, duration, format and target. The source media stays remote.",
    resource: resources.audio,
    target: "paintingAnnotation",
    selectedTab: "@manifest-editor/media-editor",
  },
};

export const VideoPaintingAnnotation: Story = {
  args: {
    title: "Video painting annotation",
    summary:
      "Edit the Cookbook Video body's dimensions, duration and format inside its real painting annotation. Expand Target to inspect canvas placement.",
    resource: resources.video,
    target: "paintingAnnotation",
    selectedTab: "@manifest-editor/media-editor",
  },
};

export const ChoicePaintingAnnotation: Story = {
  args: {
    title: "Choice of image bodies",
    summary:
      "The original Cookbook Choice offers natural-light and x-ray images. Edit option labels, reorder options, add media or unwrap the choice into individual painting annotations.",
    resource: sources.choice,
    target: "paintingAnnotation",
    selectedTab: "@manifest-editor/choice-painting-annotation-editor",
  },
};

export const HtmlAnnotationBody: Story = {
  args: {
    title: "HTML annotation body",
    summary:
      "Edit the original German HTML comment from the Cookbook. The production rich-text editor writes the TextualBody's value and language into the annotation JSON.",
    resource: sources.html,
    target: "annotation",
    selectedTab: "@manifest-editor/html-body-editor",
  },
};

export const CanvasCompositionDetail: Story = {
  args: {
    title: "Canvas detail with multiple images",
    summary:
      "The Cookbook composition has two painting annotations on one Canvas. The Detail editor shows its label and painting layers; select a layer to navigate the real editing stack.",
    resource: sources.composition,
    target: "canvas",
    selectedTab: "@manifest-editor/overview-canvas-editor",
  },
};

export const TopLevelRangeStructure: Story = {
  args: {
    title: "Top-level range structure",
    summary:
      "Explore the Cookbook book's actual table of contents. Reorder child ranges, select one to edit, or add a range with the real creator. JSON shows the selected range.",
    resource: sources.ranges,
    target: "range",
    selectedTab: "@manifest-editor/range-structural",
  },
};

export const NestedRangeWithCanvases: Story = {
  args: {
    title: "Nested range with Canvas references",
    summary:
      "This real chapter range contains two Canvas references instead of further ranges. Edit its members while the parent Manifest remains available for reference creation.",
    resource: sources.ranges,
    target: "nestedRange",
    selectedTab: "@manifest-editor/range-structural",
  },
};

export const InlineAnnotationPage: Story = {
  args: {
    title: "Inline annotation page",
    summary:
      "The Cookbook's embedded comment page opens the Annotations editor. Its original Canvas is shown above the panel, so Create annotation can request a box in the real Atlas viewer.",
    resource: sources.html,
    target: "annotationPage",
    selectedTab: "@manifest-editor/annotation-list-editor",
    showViewer: true,
  },
};

export const PartOfReference: Story = {
  args: {
    title: "Part-of collection reference",
    summary:
      "Augmentation: the Cookbook volume omits its inverse collection link. This story reads its real Collection and adds only that partOf reference in memory. The app enables Collection references. Edit the label or summary; JSON shows the parent Manifest's partOf entry.",
    resource: sources.volume,
    target: "partOf",
    selectedTab: "@manifest-editor/part-of-reference",
    app: referenceApp,
  },
};

export const ManifestStructure: Story = {
  args: {
    title: "Manifest structure with ranges",
    summary:
      "The production Structure panel lists the real book's Canvases and table of contents. Reorder, remove or add resources through the normal creator and editing stack.",
    resource: sources.ranges,
    target: "manifest",
    selectedTab: "@manifest-editor/manifest-structural",
  },
};

export const CanvasStructure: Story = {
  args: {
    title: "Canvas painting and annotation structure",
    summary:
      "The real HTML-annotation Canvas has a painting page and a separate comment page. Inspect painting resources, captions and annotation pages, with live Canvas JSON.",
    resource: sources.html,
    target: "canvas",
    selectedTab: "@manifest-editor/canvas-structural",
  },
};

export const NavPlaceMap: Story = {
  args: {
    title: "NavPlace with a real location",
    summary:
      "The Cookbook geographic example provides the Laocoön Bronze's original GeoJSON point. Use the production map drawing and edit tools; geometry changes appear in navPlace. Map tiles are remote OpenStreetMap resources.",
    resource: sources.geo,
    target: "manifest",
    selectedTab: "@manifest-editor/nav-place-editor",
  },
};

export const EmptyNavPlaceMap: Story = {
  args: {
    title: "Add geographic context",
    summary:
      "The simplest image Manifest has no navPlace. Draw a marker, polygon, rectangle or circle to create GeoJSON with the production map editor, then inspect the live Manifest JSON.",
    target: "manifest",
    selectedTab: "@manifest-editor/nav-place-editor",
  },
};

export const FallbackAnnotationTarget: Story = {
  args: {
    title: "Fallback annotation target",
    summary:
      "This story explicitly opts the production fallback editor into the preset because allEditors normally omits it. The Cookbook's plain-text comment targets the whole Canvas; Change creates a region and exposes its numeric target fields.",
    resource: sources.annotation,
    target: "annotation",
    selectedTab: "@manifest-editor/fallback-annotation-editor",
    app: fallbackApp,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /^Change$/ }, { timeout: 30000 }));
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Live resource JSON" }).textContent).toContain("xywh=")
    );
    await expect(canvas.getByRole("button", { name: "Target whole canvas" })).toBeVisible();
  },
};
