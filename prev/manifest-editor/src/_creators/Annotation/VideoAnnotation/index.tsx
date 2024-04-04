import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import { createVideoAnnotation, CreateVideoAnnotationForm } from "./create-video-annotation";

export const videoAnnotation: CreatorDefinition = {
  id: "@manifest-editor/video-annotation",
  create: createVideoAnnotation,
  label: "Video Annotation",
  summary: "Add Video annotation (mp4)",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx) {
    return <CreateVideoAnnotationForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
};
