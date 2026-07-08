import { AudioIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getContentType, isHttpUrl, matchesExtension } from "../../resource-probes";
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
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const contentType = await getContentType(value, helpers);
    if (contentType.startsWith("audio/") || matchesExtension(value, [".mp3", ".m4a", ".wav", ".ogg"])) {
      return { initialData: { url: value } };
    }
    return false;
  },
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
