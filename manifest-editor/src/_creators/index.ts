import { emptyCanvas } from "@/_creators/Canvas/EmptyCanvas";
import { plaintextCreator } from "@/_creators/ContentResource/PlaintextCreator";
import { webPageCreator } from "@/_creators/ContentResource/WebPageCreator";
import { htmlBodyCreator } from "@/_creators/ContentResource/HTMLBodyCreator";
import { htmlAnnotation } from "@/_creators/Annotation/HTMLAnnotation";
import { emptyAnnotationPage } from "@/_creators/AnnotationPage/EmptyAnnotationPage";
import { youTubeBodyCreator } from "@/_creators/ContentResource/YouTubeCreator";
import { imageUrlCreator } from "@/_creators/ContentResource/ImageUrlCreator";
import { imageServiceCreator } from "@/_creators/ContentResource/ImageServiceCreator";
import { imageServiceAnnotation } from "@/_creators/Annotation/ImageServiceAnnotation";
import { noBodyAnnotation } from "@/_creators/Annotation/NoBodyAnnotation";
import { iiifBrowserCreator } from "@/_creators/ContentResource/IIIFBrowserCreator";
import { internalCanvas } from "@/_creators/Canvas/InternalCanvas";
import { imageUrlAnnotation } from "@/_creators/Annotation/ImageUrlAnnotation";
import { audioAnnotation } from "@/_creators/Annotation/AudioAnnotation";
import { videoAnnotation } from "@/_creators/Annotation/VideoAnnotation";

export const allCreators = [
  emptyCanvas,
  plaintextCreator,
  webPageCreator,
  htmlBodyCreator,
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
];
