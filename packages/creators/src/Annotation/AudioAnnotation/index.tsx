import { AudioIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import {
  CreateAudioAnnotationForm,
  createAudioAnnotation,
} from "./create-audio-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/audio-annotation": typeof audioAnnotation;
    }
  }
}

export const audioAnnotation = defineCreator({
  id: "@manifest-editor/audio-annotation",
  create: createAudioAnnotation,
  label: "Audio",
  summary: "Audio annotation",
  icon: <AudioIcon />,
  render(ctx) {
    return <CreateAudioAnnotationForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
});
