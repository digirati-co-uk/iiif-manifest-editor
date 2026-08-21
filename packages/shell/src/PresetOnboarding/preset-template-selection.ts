import type { PresetTemplateDefinition } from "../AppContext/AppContext";

const presetTemplateTypes = new Set<string>(["fullpage", "slideshow", "scroll"]);

export function applyPresetTemplateSelection(behavior: string[], template: PresetTemplateDefinition) {
  return [
    ...behavior.filter((item) => !item.startsWith("template-") && !presetTemplateTypes.has(item)),
    template.type,
    `template-${template.id}`,
  ];
}

export function getConfiguredPresetTemplate(templates: PresetTemplateDefinition[], behavior: string[] = []) {
  const templateId = behavior.find((item) => item.startsWith("template-"))?.slice("template-".length);
  return (
    templates.find((template) => template.id === templateId) ||
    templates.find((template) => behavior.includes(template.type)) ||
    null
  );
}

export function resolvePresetTemplateSelection(
  templates: PresetTemplateDefinition[],
  selectedTemplateId?: string | null,
  behavior: string[] = [],
) {
  return (
    getConfiguredPresetTemplate(templates, behavior) ||
    templates.find((template) => template.id === selectedTemplateId) ||
    templates[0] ||
    null
  );
}
