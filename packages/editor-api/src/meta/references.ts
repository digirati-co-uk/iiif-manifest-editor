const externalProperties = [
  "thumbnail",
  "seeAlso",
  "rendering",
  "partOf",
  "supplementary",
  "homepage",
  "logo",
  "body",
  "annotations",
] as const;

const inlineProperties = ["service", "services"] as const;

const internalProperties = [
  "target",
  "provider",
  "placeholderCanvas",
  "accompanyingCanvas",
  "partOf",
  "start",
  "items",
  "structures",
  "annotations",
] as const;

const all = [
  "target",
  "thumbnail",
  "provider",
  "placeholderCanvas",
  "accompanyingCanvas",
  "seeAlso",
  "service",
  "services",
  "rendering",
  "partOf",
  "start",
  "body",
  "supplementary",
  "homepage",
  "logo",
  "items",
  "structures",
  "annotations",
] as const;

const single = ["start", "target"] as const;

export const references = {
  all,
  single,
  inlineProperties,
  externalProperties,
  internalProperties,
};
