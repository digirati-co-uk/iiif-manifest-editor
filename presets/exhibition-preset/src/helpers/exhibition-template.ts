import { type PresetTemplateDefinition, useApp, usePresetTemplateSelection } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault";

export function getExhibitionTemplate(templates: PresetTemplateDefinition[], behavior: string[] = []) {
  const templateId = behavior.find((item) => item.startsWith("template-"))?.slice("template-".length);
  return (
    templates.find((template) => template.id === templateId) ||
    templates.find((template) => behavior.includes(template.type)) ||
    null
  );
}

export function useExhibitionTemplate() {
  const templates = useApp().preset?.templates || [];
  const manifest = useManifest();
  const { selectedTemplate } = usePresetTemplateSelection();
  return getExhibitionTemplate(templates, manifest?.behavior as string[]) || selectedTemplate;
}
