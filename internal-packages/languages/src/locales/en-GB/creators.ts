/** Creator UI only. Authored IIIF values and intentional content defaults remain separate. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Empty canvas",
      summary: "Start with an image layout or a blank canvas",
    },
    internalCanvas: {
      label: "Existing canvas",
      summary: "Choose a canvas from this manifest.",
    },
    example: {
      label: "Blank canvas example",
      summary: "Create a large blank canvas with a title.",
    },
    thumbnail: {
      label: "IIIF thumbnail",
      summary: "Create a thumbnail from an IIIF image service.",
    },
    vtt: {
      label: "WebVTT captions",
      summary: "Add subtitles or captions from a WebVTT file to an audio or video canvas.",
    },
    contents: {
      label: "Table of contents",
      summary: "Create a top-level range to organise the manifest’s contents.",
    },
    provider: {
      summary: "Add the organisation responsible for providing this resource.",
    },
    browser: {
      label: "Browse IIIF content",
      summary: "Browse an IIIF manifest, collection, or supported collection webpage and choose content to add.",
      copyMetadata: "Add manifest metadata to imported canvases",
      copyMetadataHelp: "Copies metadata from the source Manifest when the IIIF Browser creates a Canvas.",
    },
    manifestBrowser: {
      summary: "Browse IIIF manifests and collections to choose a resource to add.",
    },
    audio: {
      label: "Audio",
      summary: "Add audio from a direct audio-file link.",
    },
    service: {
      label: "IIIF image",
      summary: "Add a zoomable image using an IIIF image service or info.json link.",
    },
    highlight: {
      label: "Highlight",
      summary: "Mark a region of the canvas without adding any content.",
      create: "Create highlight",
    },
    annotationPage: {
      label: "Empty annotation page",
      summary: "Create an empty page to organise annotations.",
    },
    range: {
      summary: "Group canvases or other ranges into a section.",
    },
    imageList: {
      label: "Multiple images",
      summary: "Add several images using one direct image link per line.",
    },
    plaintext: {
      label: "Plain text link",
      summary: "Link to an external plain-text file.",
    },
    htmlBody: {
      label: "Formatted text",
      summary: "Write formatted text as the content of an annotation.",
    },
    html: {
      label: "HTML",
      summary: "Write formatted text to display on a canvas.",
    },
    video: {
      label: "Video",
      summary: "Add video from a direct video-file link. Use YouTube for YouTube videos.",
    },
    imageUrl: {
      label: "Image",
      summary: "Add an image using a direct image-file link.",
    },
    captionedImage: {
      label: "Captioned image",
      summary: "Add an image from a direct link and write its caption.",
    },
    youtube: {
      label: "YouTube",
      summary: "Embed a video using its YouTube link.",
    },
    webpage: {
      label: "Web page",
      summary: "Link to an external webpage.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pixels",
    audioUrl: "Link to audio file",
    addAudio: "Add audio",
    videoUrl: "Link to video file",
    addVideo: "Add video",
    serviceUrl: "Link to image service",
    invalidService: "Invalid service",
    imageUrl: "Link to image",
    caption: "Caption",
    describeImage: "Describe the image",
    textUrl: "Link to plain-text file",
    youtubeUrl: "Link to YouTube",
    link: "Link",
    createLink: "Create link",
    createRange: "Create range",
    addThumbnail: "Add thumbnail",
    selectSize: "Select size",
    urlList: "Enter a list of URLs (one per line)",
    homepageLabel: "Homepage label",
    providerId: "Provider ID",
    providerIdHelp: "Will be generated if not specified, this is not a URL that the user can follow",
    addProvider: "Add provider",
    vttHelp: "Link an existing WebVTT (.vtt) file to this canvas. Host the file at a public URL before adding it.",
    vttUrl: "WebVTT file URL",
    absoluteUrl: "Enter an absolute http:// or https:// URL",
    languageCode: "Language (BCP 47 code)",
    languageCodeHelp: "A language code such as en, fr or pt-BR",
    addCaptions: "Add captions",
  },
  browser: {
    selectCanvas: "Select canvas",
    select: "Select",
    addToManifest: "Add to manifest",
  },
  errors: {
    media: "Could not load this media. Check the link and try again.",
    details: "Technical details",
    service: "Could not load the image service. Check the link and try again.",
    vttUrl: "Enter an absolute HTTP or HTTPS URL for the WebVTT file.",
    vttCanvas: "WebVTT captions must belong to a Canvas.",
    manifest: "Could not load the selected manifest.",
    collection: "Could not load the selected collection.",
    canvas: "Could not load the selected canvas.",
  },
  resource: {
    create: "Create resource",
    chooseType: "Choose a resource type",
    label: "Label",
    url: "URL",
    invalidUrl: "Enter a valid URL",
    createFailed: "Could not create this resource",
  },
  canvas: {
    create: "Create canvas",
    width: "Width",
    height: "Height",
    duration: "Duration",
  },
  image: {
    fromUrl: "Image URL",
    fromService: "IIIF image service",
    browse: "Browse images",
    previewAlt: "Preview of selected resource",
    use: "Use image",
  },
  content: {
    webPage: "Web page",
    manifest: "Manifest",
    collection: "Collection",
  },
} as const;
