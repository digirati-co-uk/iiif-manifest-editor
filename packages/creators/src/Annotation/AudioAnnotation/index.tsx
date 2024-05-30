import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { createAudioAnnotation, CreateAudioAnnotationForm } from "./create-audio-annotation";
import { AudioIcon } from "@manifest-editor/components";

export const audioAnnotation: CreatorDefinition = {
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
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
};
