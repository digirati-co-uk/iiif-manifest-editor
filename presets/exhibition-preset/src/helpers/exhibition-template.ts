import { type PresetTemplateDefinition, useApp, usePresetTemplateSelection } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault";

function getFallbackTemplateType(appId?: string) {
  if (appId === "exhibition-slideshow-editor") return "slideshow";
  if (appId === "exhibition-scrolling-editor") return "scroll";
  return "fullpage";
}

export function getExhibitionTemplate(templates: PresetTemplateDefinition[], behavior: string[] = []) {
  const templateId = behavior.find((item) => item.startsWith("template-"))?.slice("template-".length);
  return (
    templates.find((template) => template.id === templateId) ||
    templates.find((template) => behavior.includes(template.type)) ||
    null
  );
}

export function useExhibitionTemplate() {
  const app = useApp();
  const templates = app.preset?.templates || [];
  const manifest = useManifest();
  const { selectedTemplate } = usePresetTemplateSelection();
  return (
    getExhibitionTemplate(templates, manifest?.behavior as string[]) ||
    selectedTemplate ||
    templates.find((template) => template.type === getFallbackTemplateType(app.metadata.id)) ||
    null
  );
}
