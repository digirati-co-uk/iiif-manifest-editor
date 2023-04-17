const externalProperties = [
  "thumbnail",
  "seeAlso",
  "rendering",
  "partOf",
  "supplementary",
  "homepage",
  "logo",
  "annotations",
];

const inlineProperties = ["service", "services"];

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
];

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
  "supplementary",
  "homepage",
  "logo",
  "items",
  "structures",
  "annotations",
];

const single = ["start", "target"];

export const references = {
  all,
  single,
  inlineProperties,
  externalProperties,
  internalProperties,
};
