import type { MessageReference } from "@manifest-editor/i18n/core";

/** Add tutorials here: the Markdown and all resource URLs travel with each new project. */
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  source: { title: string; url: string };
  markdown: string;
  messages?: {
    title: MessageReference;
    description: MessageReference;
    duration: MessageReference;
    markdown: MessageReference;
  };
}

const image = "https://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png";
const recipe = "https://iiif.io/api/cookbook/recipe/0001-mvm-image/";

export const tutorials: Tutorial[] = [
  {
    id: "single-image-manifest",
    messages: {
      title: { namespace: "web", key: "tutorials.firstTitle" },
      description: { namespace: "web", key: "tutorials.firstDescription" },
      duration: { namespace: "web", key: "tutorials.tenMinutes" },
      markdown: { namespace: "web", key: "tutorials.firstNotebook" },
    },
    title: "Your first image manifest",
    description: "Turn one image into an IIIF manifest. Add a canvas, give it a label, and download your work.",
    duration: "10 minutes",
    thumbnail: image,
    source: { title: "IIIF Cookbook: Simplest Manifest — Single Image File", url: recipe },
    markdown: `# Your first image manifest

Build a small manifest from a single image. No JSON editing is needed. This notebook is your working copy: tick each step as you finish, and add your own notes below it.

## What you will make

A manifest with one canvas displaying this page image. A canvas is the space where a viewer presents your content; the image is attached to it by a painting annotation.

[Page image — use this resource](${image})

## 1. Name your manifest

- [ ] Select **Manifest summary** in the left-hand panel menu, then **Edit** beside the title. Set the English label to **Single Image Example**.

Return to **Notebook** in the panel menu whenever you need these instructions. Your changes are saved as you work in this browser.

## 2. Add the image

- [ ] Select **Start adding content** in the main area.
- [ ] Under **Saved in your notebook**, choose **Page image for this tutorial**. If you do not see it, paste the page image link above into **Paste a link** and select **Use link**.
- [ ] The image form should contain the image URL. Select **Create**.

You should now see one canvas with the page image. The editor creates the annotation page and painting annotation for you.

## 3. Check your canvas

- [ ] Give the canvas a useful label, such as **Page 1**, using its editing panel.
- [ ] Check that the whole page is visible on the canvas, without cropping.

The canvas size and the image size match in this example. You do not need to add another canvas or annotation manually.

## 4. Preview and download

- [ ] Use **Preview** in the header to inspect the manifest in a viewer. You may need to choose a viewer from the menu beside Preview.
- [ ] Select **Download manifest** in the header to save the JSON file.

This project is saved locally in this browser. Download a copy if you want to keep it elsewhere. Downloading does not publish a manifest at its identifier URL.

## 5. Look at what you made

Open the downloaded file in a text editor and look for this structure:

1. The **Manifest** has a label and one canvas in its items.
2. The **Canvas** has **width: 1200**, **height: 1800**, and an annotation page. These dimensions come from the image automatically.
3. That page holds a **painting** annotation whose body is the image.

Your generated identifiers will differ from the cookbook's; that is expected. The goal is the same structure and visible result.

- [ ] I can explain how a manifest, canvas, and image fit together.

## Your source image

![Page image for this tutorial](${image})

## Compare and explore

This exercise is adapted from the IIIF Cookbook recipe “Simplest Manifest — Single Image File.” You can find the original recipe from the Tutorials page.

This exercise uses an ordinary image file. IIIF image services can also provide zoomable images; you can explore those in another project.

## Your notes

What would you try with your own image?
`,
  },
];
