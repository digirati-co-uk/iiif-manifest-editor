import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import { createAudioAnnotation, CreateAudioAnnotationForm } from "./create-audio-annotation";

export const audioAnnotation: CreatorDefinition = {
  id: "@manifest-editor/audio-annotation",
  create: createAudioAnnotation,
  label: "Audio Annotation",
  summary: "Add Audio annotation (mp3/wav/ogg/mp4)",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx) {
    return <CreateAudioAnnotationForm {...ctx} />;
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
