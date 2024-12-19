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
  noBodyAnnotation,
  iiifBrowserCreator,
  internalCanvas,
  imageUrlAnnotation,
  audioAnnotation,
  videoAnnotation,
  captionedImageAnnotation,
  // Not included
  manifestBrowserCreator,
};
