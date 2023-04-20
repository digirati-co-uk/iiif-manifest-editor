import { emptyCanvas } from "@/_creators/Canvas/EmptyCanvas";
import { plaintextCreator } from "@/_creators/ContentResource/PlaintextCreator";
import { webPageCreator } from "@/_creators/ContentResource/WebPageCreator";
import { htmlBodyCreator } from "@/_creators/ContentResource/HTMLBodyCreator";
import { htmlAnnotation } from "@/_creators/Annotation/HTMLAnnotation";
import { emptyAnnotationPage } from "@/_creators/AnnotationPage/EmptyAnnotationPage";
import { youTubeBodyCreator } from "@/_creators/ContentResource/YouTubeCreator";
import { youTubeCanvas } from "@/_creators/Canvas/YouTubeCanvas";
import { imageUrlCreator } from "@/_creators/ContentResource/ImageUrlCreator";
import { imageServiceCreator } from "@/_creators/ContentResource/ImageServiceCreator";
import { imageServiceAnnotation } from "@/_creators/Annotation/ImageServiceAnnotation";
import { youTubeAnnotation } from "@/_creators/Annotation/YouTubeAnnotation";

export const allCreators = [
  emptyCanvas,
  plaintextCreator,
  webPageCreator,
  htmlBodyCreator,
  htmlBodyCreator,
  htmlAnnotation,
  emptyAnnotationPage,
  youTubeBodyCreator,
  youTubeCanvas,
  imageUrlCreator,
  imageServiceCreator,
  imageServiceAnnotation,
  youTubeAnnotation,
];
