export type ResourceEditorConfig<T = any> = [string, T] | string;

export function supportsProperty<T>(list: ResourceEditorConfig[], property: string): T | null {
  for (const config of list) {
    const type = typeof config === "string" ? config : config[0];
    if (type === property) {
      return typeof config === "string" ? config || {} : config[1] || {};
    }
  }

  return null;
}
