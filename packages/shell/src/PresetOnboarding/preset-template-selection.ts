import type { PresetTemplateDefinition } from "../AppContext/AppContext";

export function resolvePresetTemplateSelection(
  templates: PresetTemplateDefinition[],
  selectedTemplateId?: string | null,
  behavior: string[] = [],
) {
  const templateId = behavior.find((item) => item.startsWith("template-"))?.slice("template-".length);
  return (
    templates.find((template) => template.id === templateId) ||
    templates.find((template) => behavior.includes(template.type)) ||
    templates.find((template) => template.id === selectedTemplateId) ||
    templates[0] ||
    null
  );
}
