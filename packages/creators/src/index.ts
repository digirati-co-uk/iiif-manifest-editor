import { emptyCanvas } from "./Canvas/EmptyCanvas";
import { plaintextCreator } from "./ContentResource/PlaintextCreator";
import { webPageCreator } from "./ContentResource/WebPageCreator";
import { htmlBodyCreator } from "./ContentResource/HTMLBodyCreator";
import { htmlAnnotation } from "./Annotation/HTMLAnnotation";
import { emptyAnnotationPage } from "./AnnotationPage/EmptyAnnotationPage";
import { youTubeBodyCreator } from "./ContentResource/YouTubeCreator";
import { imageUrlCreator } from "./ContentResource/ImageUrlCreator";
import { imageServiceCreator } from "./ContentResource/ImageServiceCreator";
import { imageServiceAnnotation } from "./Annotation/ImageServiceAnnotation";
import { noBodyAnnotation } from "./Annotation/NoBodyAnnotation";
import { iiifBrowserCreator } from "./ContentResource/IIIFBrowserCreator";
import { internalCanvas } from "./Canvas/InternalCanvas";
import { imageUrlAnnotation } from "./Annotation/ImageUrlAnnotation";
import { audioAnnotation } from "./Annotation/AudioAnnotation";
import { videoAnnotation } from "./Annotation/VideoAnnotation";
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
  // Not included
  manifestBrowserCreator,
};
