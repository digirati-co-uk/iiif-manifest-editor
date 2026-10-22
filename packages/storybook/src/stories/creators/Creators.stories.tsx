import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  audioAnnotation,
  emptyCanvas,
  htmlBodyCreator,
  imageServiceCreator,
  imageUrlAnnotation,
  imageUrlCreator,
  plaintextCreator,
  providerCreator,
  rangeTopLevel,
  videoAnnotation,
  webPageCreator,
  youTubeBodyCreator,
} from "@manifest-editor/creators";
import { CreatorWorkbench } from "../../support/CreatorWorkbench";
import { resources } from "../../support/resources";

const image = "https://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png";
const service = "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/info.json";
const audio = "https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4";
const video = "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4";

const text = "https://www.gutenberg.org/ebooks/11.txt.utf-8";

const meta = {
  title: "Creators",
  component: CreatorWorkbench,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  tags: ["autodocs"],
} satisfies Meta<typeof CreatorWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PlainTextBody: Story = {
  args: {
    title: "Plain text body",
    creator: plaintextCreator,
    parent: "seeAlso",
    summary:
      "Use the built-in text link form, then inspect its created Text resource. This creator attaches to seeAlso or rendering.",
    initialData: { url: text, label: { en: ["Alice’s Adventures in Wonderland"] } },
    example: text,
    source: "https://www.gutenberg.org/ebooks/11",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const json = () => canvas.getByRole("complementary", { name: "Created resource JSON" });
    await waitFor(() => expect(json()).toHaveTextContent(`"id": "${text}"`));
    const input = canvasElement.querySelector<HTMLInputElement>('input[name="url"]');
    if (!input) throw new Error("Plain text URL input was not rendered");
    await expect(input).toHaveValue(text);
    await userEvent.clear(input);
    await userEvent.type(input, "https://www.gutenberg.org/ebooks/84.txt.utf-8");
    await userEvent.click(canvas.getByRole("button", { name: /^Create$/ }));
    await waitFor(() => expect(json()).toHaveTextContent('"id": "https://www.gutenberg.org/ebooks/84.txt.utf-8"'));
    await expect(json()).toHaveTextContent('"format": "text/plain"');
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(json()).toHaveTextContent(`"id": "${text}"`));
    await expect(canvasElement.querySelector('input[name="url"]')).toHaveValue(text);
  },
};

export const WebPageBody: Story = {
  args: {
    title: "Web page body",
    creator: webPageCreator,
    parent: "seeAlso",
    summary: "Create an HTML link using the production multilingual label and URL form.",
    initialData: { url: "https://iiif.io/api/cookbook/", label: { en: ["The IIIF Cookbook"] } },
    example: "https://iiif.io/api/cookbook/",
    source: "https://iiif.io/api/cookbook/",
  },
};

export const ImageUrlBody: Story = {
  args: {
    title: "Image URL body",
    creator: imageUrlCreator,
    parent: "body",
    summary:
      "Create an Image body from the Cookbook fixture. Image dimensions and format are resolved from the remote resource.",
    initialData: { url: image, format: "image/png", width: 1200, height: 1800 },
    source: resources.image,
  },
};

export const ImageServiceBody: Story = {
  args: {
    title: "IIIF image service body",
    creator: imageServiceCreator,
    parent: "body",
    summary:
      "Preview and create an image with an embedded IIIF Image API service using the production service form. The service must permit browser requests.",
    initialData: {
      url: service,
      service: {
        id: service.replace("/info.json", ""),
        type: "ImageService3",
        profile: "level1",
        width: 4032,
        height: 3024,
      },
    },
    source: resources.imageService,
  },
};

export const HtmlBody: Story = {
  args: {
    title: "HTML body",
    creator: htmlBodyCreator,
    initialData: { body: "<p>Explore <strong>IIIF resources</strong> with the Manifest Editor.</p>", language: "en" },
    parent: "body",
    summary:
      "Write rich text in the actual editor. Create serializes a TextualBody with language, HTML format and value.",
  },
};

export const YouTubeBody: Story = {
  args: {
    title: "YouTube body",
    creator: youTubeBodyCreator,
    parent: "body",
    summary: "Create the editor's YouTube Video resource and its service descriptions from a video link.",
    initialData: { youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
    source: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  },
};

export const EmptyCanvas: Story = {
  args: {
    title: "Empty canvas",
    creator: emptyCanvas,
    initialData: { label: { en: ["A blank canvas"] }, width: 1200, height: 1800 },
    parent: "items",
    summary:
      "This creator has no built-in form. These label and dimension fields call its real API and create a Canvas with an empty AnnotationPage.",
  },
};

export const ProviderAgent: Story = {
  args: {
    title: "Provider / Agent",
    creator: providerCreator,
    parent: "provider",
    summary:
      "Create an Agent with a multilingual label, optional logo and homepage using the production provider form.",
    initialData: {
      url: "https://www.tudelft.nl/library",
      label: { en: ["TU Delft Library"] },
      homepage: "https://www.tudelft.nl/library",
    },
    source: resources.delftCollection,
  },
};

export const ImagePaintingAnnotation: Story = {
  args: {
    title: "Image URL painting annotation",
    creator: imageUrlAnnotation,
    parent: "painting",
    summary:
      "Create a painting Annotation targeting the sandbox Canvas. The built-in creator also runs its canvas sizing side effects.",
    initialData: { url: image, format: "image/png", width: 1200, height: 1800 },
    source: resources.image,
  },
};

export const AudioPaintingAnnotation: Story = {
  args: {
    title: "Audio painting annotation",
    creator: audioAnnotation,
    parent: "painting",
    summary:
      "Preview the Cookbook audio, edit its label and detected duration, then create a Sound painting annotation. Remote media loading can take a moment.",
    initialData: { url: audio, duration: 1985, label: { en: ["128Kbps"] } },
    source: resources.audio,
  },
};

export const VideoPaintingAnnotation: Story = {
  args: {
    title: "Video painting annotation",
    creator: videoAnnotation,
    parent: "painting",
    summary:
      "Preview the Cookbook video with the production player, then create a Video painting annotation using its dimensions and duration.",
    initialData: {
      url: video,
      width: 480,
      height: 360,
      duration: 572.033333,
      label: { en: ["lunchroom_manners_1024kb"] },
    },
    source: resources.video,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Created resource JSON" })).toHaveTextContent('"width": 480')
    );
    await expect(canvas.getByRole("textbox", { name: "URL" })).toHaveValue(video);
    await userEvent.clear(canvas.getByRole("textbox", { name: "URL" }));
    await waitFor(() => expect(canvas.queryByRole("spinbutton", { name: /Width/ })).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Add video" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(canvas.getByRole("spinbutton", { name: /Width/ })).toHaveValue(480));
    await expect(canvas.getByRole("spinbutton", { name: /Height/ })).toHaveValue(360);
    await expect(canvas.getByRole("textbox", { name: "URL" })).toHaveValue(video);
  },
};

export const TopLevelRange: Story = {
  args: {
    title: "Top-level range",
    creator: rangeTopLevel,
    initialData: { type: "Range", label: { en: ["Table of contents"] } },
    parent: "structures",
    summary: "Use the built-in multilingual label form to add a top-level Range to the sandbox manifest's structures.",
  },
};
