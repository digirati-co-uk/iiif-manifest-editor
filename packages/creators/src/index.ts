import "./index.css";
import { providerCreator } from "./Agent/ProviderCreator";
import { audioAnnotation } from "./Annotation/AudioAnnotation";
import { captionedImageAnnotation } from "./Annotation/CaptionedImageAnnotation";
import { htmlAnnotation } from "./Annotation/HTMLAnnotation";
import { imageServiceAnnotation } from "./Annotation/ImageServiceAnnotation";
import { imageUrlAnnotation } from "./Annotation/ImageUrlAnnotation";
import { imageUrlListAnnotation } from "./Annotation/ImageUrlListAnnotation";
import { noBodyAnnotation } from "./Annotation/NoBodyAnnotation";
import { videoAnnotation } from "./Annotation/VideoAnnotation";
import { emptyAnnotationPage } from "./AnnotationPage/EmptyAnnotationPage";
import { emptyCanvas } from "./Canvas/EmptyCanvas";
import { internalCanvas } from "./Canvas/InternalCanvas";
import { htmlBodyCreator } from "./ContentResource/HTMLBodyCreator";
import { iiifBrowserCreator } from "./ContentResource/IIIFBrowserCreator";
import { imageServiceCreator } from "./ContentResource/ImageServiceCreator";
import { imageUrlCreator } from "./ContentResource/ImageUrlCreator";
import { imageUrlListCreator } from "./ContentResource/ImageUrlListCreator";
import { plaintextCreator } from "./ContentResource/PlaintextCreator";
import { thumbnailCreator } from "./ContentResource/ThumbnailCreator";
import { webPageCreator } from "./ContentResource/WebPageCreator";
import { youTubeBodyCreator } from "./ContentResource/YouTubeCreator";
import { manifestBrowserCreator } from "./Manifest/ManifestBrowserCreator";
import { rangeWithItems } from "./Range/RangeWithItems";
import { rangeTopLevel } from "./Range/TopLevelRangeCreator";

export * from "./Annotation/AudioAnnotation/create-audio-annotation";
export * from "./Annotation/CaptionedImageAnnotation/create-captioned-image-annotation";
export * from "./Annotation/HTMLAnnotation/create-html-annotation";
export * from "./Annotation/ImageServiceAnnotation/create-service-annotation";
export * from "./Annotation/ImageUrlAnnotation/create-image-url-annotation";
export * from "./Annotation/ImageUrlListAnnotation/create-image-url-list-annotation";
export * from "./Annotation/NoBodyAnnotation/index";
export * from "./Annotation/VideoAnnotation/create-video-annotation";
export * from "./Canvas/InternalCanvas/index";
export * from "./ContentResource/HTMLBodyCreator/create-html-body";
export * from "./ContentResource/IIIFBrowserCreator/iiif-browser-creator";
export * from "./ContentResource/ImageServiceCreator/create-image-service";
export * from "./ContentResource/ImageUrlCreator/create-image-url";
export * from "./ContentResource/ImageUrlListCreator/create-image-url-list";
export * from "./ContentResource/PlaintextCreator/create-plaintext";
export * from "./ContentResource/ThumbnailCreator/create-thumbnail";
export * from "./ContentResource/WebPageCreator/create-web-page";
export * from "./ContentResource/YouTubeCreator/create-youtube-body";
export * from "./Manifest/ManifestBrowserCreator/manifest-browser-creator";
export * from "./Range/RangeWithItems/create-range-with-items";
export * from "./Range/TopLevelRangeCreator/create-range-top-level";

export const allCreators = [
  // Images first.
  imageServiceCreator,
  imageServiceAnnotation,
  imageUrlCreator,
  imageUrlAnnotation,
  videoAnnotation,
  audioAnnotation,
  htmlBodyCreator,
  htmlAnnotation,
  youTubeBodyCreator,
  iiifBrowserCreator,
  emptyCanvas,
  plaintextCreator,
  webPageCreator,
  emptyAnnotationPage,
  noBodyAnnotation,
  internalCanvas,
  captionedImageAnnotation,
  imageUrlListCreator,
  imageUrlListAnnotation,
  thumbnailCreator,
  rangeTopLevel,
  rangeWithItems,
  providerCreator,
];

export {
  emptyCanvas,
  plaintextCreator,
  webPageCreator,
  htmlBodyCreator,
  htmlAnnotation,
  emptyAnnotationPage,
  youTubeBodyCreator,
  imageUrlCreator,
  imageServiceCreator,
  imageServiceAnnotation,
  // noBodyAnnotation,
  iiifBrowserCreator,
  imageUrlAnnotation,
  audioAnnotation,
  videoAnnotation,
  captionedImageAnnotation,
  imageUrlListCreator,
  imageUrlListAnnotation,
  rangeTopLevel,
  rangeWithItems,
  // Not included
  manifestBrowserCreator,
  providerCreator,
};
