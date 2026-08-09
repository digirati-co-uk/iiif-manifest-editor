export function getFirstAnnotationBody(annotation: any) {
  return Array.isArray(annotation?.body) ? annotation.body[0] : annotation?.body;
}

export function resolveFirstAnnotationBody(annotation: any, vault: any) {
  const body = getFirstAnnotationBody(annotation);
  return body ? vault.get(body, { preserveSpecificResources: true, skipSelfReturn: false }) || body : undefined;
}
