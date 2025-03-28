import { audioAnnotation } from "./Annotation/AudioAnnotation";
import { captionedImageAnnotation } from "./Annotation/CaptionedImageAnnotation";
import { htmlAnnotation } from "./Annotation/HTMLAnnotation";
import { imageServiceAnnotation } from "./Annotation/ImageServiceAnnotation";
import { imageUrlAnnotation } from "./Annotation/ImageUrlAnnotation";
import { noBodyAnnotation } from "./Annotation/NoBodyAnnotation";
import { videoAnnotation } from "./Annotation/VideoAnnotation";
import { emptyAnnotationPage } from "./AnnotationPage/EmptyAnnotationPage";
import { emptyCanvas } from "./Canvas/EmptyCanvas";
import { internalCanvas } from "./Canvas/InternalCanvas";
import { htmlBodyCreator } from "./ContentResource/HTMLBodyCreator";
import { iiifBrowserCreator } from "./ContentResource/IIIFBrowserCreator";
import { imageServiceCreator } from "./ContentResource/ImageServiceCreator";
import { imageUrlCreator } from "./ContentResource/ImageUrlCreator";
import { plaintextCreator } from "./ContentResource/PlaintextCreator";
import { webPageCreator } from "./ContentResource/WebPageCreator";
import { youTubeBodyCreator } from "./ContentResource/YouTubeCreator";
import { manifestBrowserCreator } from "./Manifest/ManifestBrowserCreator";

export * from "./Annotation/AudioAnnotation/create-audio-annotation";
export * from "./Annotation/CaptionedImageAnnotation/create-captioned-image-annotation";
export * from "./Annotation/HTMLAnnotation/create-html-annotation";
export * from "./Annotation/ImageUrlAnnotation/create-image-url-annotation";
export * from "./Annotation/ImageServiceAnnotation/create-service-annotation";
export * from "./Annotation/VideoAnnotation/create-video-annotation";
export * from "./Annotation/NoBodyAnnotation/index";
export * from "./Canvas/InternalCanvas/index";
export * from "./ContentResource/HTMLBodyCreator/create-html-body";
export * from "./ContentResource/IIIFBrowserCreator/iiif-browser-creator";
export * from "./ContentResource/ImageServiceCreator/create-image-service";
export * from "./ContentResource/ImageUrlCreator/create-image-url";
export * from "./ContentResource/PlaintextCreator/create-plaintext";
export * from "./ContentResource/WebPageCreator/create-web-page";
export * from "./ContentResource/YouTubeCreator/create-youtube-body";

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
  // Not included
  manifestBrowserCreator,
};
