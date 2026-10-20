import {
  allCreators,
  captionedImageAnnotation,
  emptyAnnotationPage,
  htmlAnnotation,
  iiifBrowserCreator,
  imageServiceAnnotation,
  imageUrlListAnnotation,
  imageUrlListCreator,
  internalCanvas,
  manifestBrowserCreator,
  noBodyAnnotation,
  rangeWithItems,
  vttAnnotationPage,
} from "@manifest-editor/creators";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CreatorWorkbench } from "../../support/CreatorWorkbench";
import { resources } from "../../support/resources";

const sandbox = "https://example.org/storybook/manifest";
const image = {
  url: "https://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png",
  format: "image/png",
  width: 1200,
  height: 1800,
};
const image2 = {
  url: "https://iiif.io/api/presentation/2.1/example/fixtures/resources/page2-full.png",
  format: "image/png",
  width: 1200,
  height: 1800,
};
const service = {
  id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
  type: "ImageService3",
  profile: "level1",
  width: 4032,
  height: 3024,
};
const thumbnailCreator = allCreators.find((creator) => creator.id === "@manifest-editor/thumbnail-image")!;
const meta = {
  title: "Creators/More creators",
  component: CreatorWorkbench,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  tags: ["autodocs"],
} satisfies Meta<typeof CreatorWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ImageServicePaintingAnnotation: Story = {
  args: {
    title: "IIIF image service painting annotation",
    creator: imageServiceAnnotation,
    parent: "painting",
    summary: "Create a painting annotation with an embedded remote ImageService3 and a Canvas target.",
    source: resources.imageService,
    initialData: { url: `${service.id}/info.json`, service },
  },
};

export const HtmlAnnotation: Story = {
  args: {
    title: "HTML annotation",
    creator: htmlAnnotation,
    parent: "commenting",
    summary: "Create a commenting annotation with an HTML TextualBody using the real rich text form.",
    initialData: { body: { en: ["<p>A <strong>comment</strong> on this Canvas.</p>"] }, motivation: "commenting" },
  },
};

export const BrowseIiifCanvas: Story = {
  args: {
    title: "Browse IIIF canvas",
    creator: iiifBrowserCreator,
    parent: "painting",
    summary:
      "Browse the remote Cookbook manifest and import a selected canvas as a painting annotation. The initial example uses the same browser output API.",
    source: resources.imageService,
    initialData: {
      url: resources.imageService,
      output: [
        {
          resource: { id: "https://iiif.io/api/cookbook/recipe/0005-image-service/canvas/p1", type: "Canvas" },
          parent: { id: resources.imageService, type: "Manifest" },
        },
      ],
    },
  },
};

export const EmptyAnnotationPage: Story = {
  args: {
    title: "Empty annotation page",
    creator: emptyAnnotationPage,
    parent: "annotations",
    summary:
      "Add an empty page to Canvas annotations. This definition has no built-in form, so a label control calls its real API.",
    initialData: { label: { en: ["Research notes"] } },
  },
};

export const WebVttCaptions: Story = {
  args: {
    title: "WebVTT caption page",
    creator: vttAnnotationPage,
    parent: "captions",
    summary: "Link the Cookbook's real WebVTT file to a video Canvas as supplementing annotations.",
    source: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json",
    initialData: {
      url: "https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt",
      language: "en",
      label: { en: ["English captions"] },
    },
  },
};

export const AnnotationWithoutBody: Story = {
  args: {
    title: "Annotation without a body",
    creator: noBodyAnnotation,
    parent: "commenting",
    summary: "Create a highlighting annotation with a target and motivation. This definition has no built-in form.",
    initialData: { label: { en: ["A passage to revisit"] }, motivation: "highlighting" },
  },
};

export const InternalCanvasLink: Story = {
  args: {
    title: "Internal canvas link",
    creator: internalCanvas,
    parent: "start",
    summary:
      "Choose an existing Canvas from this manifest as its start Canvas. Linking preserves the Canvas's painting resources and dimensions.",
    initialData: { id: `${sandbox}/av-canvas` },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Created resource JSON" })).toHaveTextContent('"width": 480')
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await userEvent.click(await canvas.findByRole("row", { name: "Video canvas for captions" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Select canvas" }));
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Created resource JSON" })).toHaveTextContent('"width": 480')
    );
  },
};

export const CaptionedImageAnnotation: Story = {
  args: {
    title: "Captioned image annotation",
    creator: captionedImageAnnotation,
    parent: "commenting",
    summary: "Create a commenting annotation with a remote image and an HTML caption body.",
    source: resources.image,
    initialData: {
      imageUrl: image.url,
      body: { en: ["A page from the Cookbook image fixture."] },
      motivation: "commenting",
    },
  },
};

export const ImageUrlList: Story = {
  args: {
    title: "Image URL list",
    creator: imageUrlListCreator,
    parent: "body",
    summary: "Create two real remote Image resources from the multiline URL form.",
    source: resources.image,
    initialData: { images: [image, image2] },
  },
};

export const ImageListPaintingAnnotations: Story = {
  args: {
    title: "Image list painting annotations",
    creator: imageUrlListAnnotation,
    parent: "painting",
    summary: "Create one painting annotation for each image URL and inspect the resulting array.",
    source: resources.image,
    initialData: { images: [image, image2] },
  },
};

export const ThumbnailFromService: Story = {
  args: {
    title: "Thumbnail from image service",
    creator: thumbnailCreator,
    parent: "thumbnail",
    summary: "Create a 400-pixel thumbnail from the real Cookbook Image API service.",
    source: resources.imageService,
    initialData: {
      url: `${service.id}/info.json`,
      service,
      width: 400,
      height: 300,
      thumbnailUrl: `${service.id}/full/400,300/0/default.jpg`,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const json = () => canvas.getByRole("complementary", { name: "Created resource JSON" });
    await waitFor(() => expect(json()).toHaveTextContent('"width": 400'));
    await userEvent.click(canvas.getByRole("button", { name: "Add thumbnail" }));
    await waitFor(() => expect(json()).toHaveTextContent('"height": 300'));
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(json()).toHaveTextContent('"width": 400'));
  },
};

export const RangeWithItems: Story = {
  args: {
    title: "Range with canvas items",
    creator: rangeWithItems,
    parent: "rangeItems",
    summary: "Create a nested Range containing a real Canvas reference from this manifest.",
    initialData: {
      type: "Range",
      label: { en: ["Selected pages"] },
      items: [{ id: `${sandbox}/canvas`, type: "Canvas" }],
    },
  },
};

export const BrowseManifest: Story = {
  args: {
    title: "Browse a manifest reference",
    creator: manifestBrowserCreator,
    parent: "partOf",
    summary:
      "Browse remote manifests and create a reference in this manifest's partOf. The creator is registered locally for this story.",
    source: resources.imageService,
    initialData: {
      url: resources.imageService,
      output: [{ resource: { id: resources.imageService, type: "Manifest" } }],
    },
  },
};
