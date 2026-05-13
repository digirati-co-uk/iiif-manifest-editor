import type { Vault } from "@iiif/helpers/vault";
import type { Reference } from "@iiif/presentation-3";
import type {
  ManifestEditorSpecification,
  SpecificationEditorTarget,
  SpecificationEntityType,
  SpecificationJsonValue,
  SpecificationPropertyPath,
  SpecificationPropertyPolicy,
  SpecificationReport,
  SpecificationReportItem,
  SpecificationReportStatus,
  SpecificationRule,
  SpecificationTextValue,
} from "./SpecificationContext.types";

const entityTypes = new Set<SpecificationEntityType>([
  "Collection",
  "Manifest",
  "Canvas",
  "Range",
  "AnnotationPage",
  "Annotation",
  "ContentResource",
  "Agent",
]);

const emptyCounts: Record<SpecificationReportStatus, number> = {
  satisfied: 0,
  missing: 0,
  invalid: 0,
  disallowed: 0,
  "not-applicable": 0,
};

const descriptiveProperties = new Set([
  "label",
  "summary",
  "language",
  "navDate",
  "provider",
  "requiredStatement",
  "rights",
  "thumbnail",
]);

type CollectedResource = {
  ref: Reference;
  resource: any;
};

export function normaliseSpecificationPath(
  path: SpecificationPropertyPath | string | undefined,
): SpecificationPropertyPath {
  if (!path) return [];
  return Array.isArray(path)
    ? path.filter(Boolean)
    : path.split(".").filter(Boolean);
}

export function specificationPathEquals(
  a: SpecificationPropertyPath | string | undefined,
  b: SpecificationPropertyPath | string | undefined,
) {
  const pathA = normaliseSpecificationPath(a);
  const pathB = normaliseSpecificationPath(b);
  return (
    pathA.length === pathB.length &&
    pathA.every((part, index) => part === pathB[index])
  );
}

export function getValueAtPath(
  resource: any,
  path: SpecificationPropertyPath | string | undefined,
): unknown {
  let current = resource;
  for (const part of normaliseSpecificationPath(path)) {
    if (current == null) {
      return undefined;
    }
    current = current[part as keyof typeof current];
  }
  return current;
}

export function setValueAtPath(
  resource: any,
  path: SpecificationPropertyPath | string,
  value: unknown,
): any {
  const parts = normaliseSpecificationPath(path);
  if (!parts.length) return value;

  const next = Array.isArray(resource)
    ? [...resource]
    : { ...(resource || {}) };
  let cursor = next;

  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }

    const existing = cursor[part];
    cursor[part] = Array.isArray(existing)
      ? [...existing]
      : { ...(existing || {}) };
    cursor = cursor[part];
  });

  return next;
}

export function hasMeaningfulValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value))
    return value.some((item) => hasMeaningfulValue(item));
  if (typeof value !== "object") return false;

  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return false;

  const looksLikeLanguageMap = entries.every(([, item]) => {
    return (
      typeof item === "string" ||
      (Array.isArray(item) && item.every((value) => typeof value === "string"))
    );
  });

  if (looksLikeLanguageMap) {
    return entries.some(([, item]) => hasMeaningfulValue(item));
  }

  return true;
}

export function normaliseJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normaliseJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normaliseJsonValue((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

export function specificationJsonEquals(a: unknown, b: unknown): boolean {
  return (
    JSON.stringify(normaliseJsonValue(a)) ===
    JSON.stringify(normaliseJsonValue(b))
  );
}

export function getTerminologyLabel(
  specifications: ManifestEditorSpecification[] | undefined,
  entityType: SpecificationEntityType | string | undefined,
  path: SpecificationPropertyPath | string | undefined,
  fallback?: string,
): string {
  const normalisedPath = normaliseSpecificationPath(path);

  for (const specification of specifications || []) {
    for (const item of specification.terminology?.properties || []) {
      if (item.entityType && item.entityType !== entityType) continue;
      if (specificationPathEquals(item.path, normalisedPath)) {
        return item.label;
      }
    }
  }

  return fallback || humanisePath(normalisedPath);
}

export function getPropertyPolicy(
  specifications: ManifestEditorSpecification[] | undefined,
  resource: Reference | null | undefined,
  path: SpecificationPropertyPath | string,
): SpecificationPropertyPolicy {
  const normalisedPath = normaliseSpecificationPath(path);
  const rules: SpecificationRule[] = [];
  let fixedValue: SpecificationJsonValue | undefined;
  let fixedValueRule: SpecificationPropertyPolicy["fixedValueRule"];
  let disallowed = false;
  let required = false;

  if (!resource || !entityTypes.has(resource.type as SpecificationEntityType)) {
    return {
      entityType: resource?.type as SpecificationEntityType | undefined,
      path: normalisedPath,
      label: getTerminologyLabel(
        specifications,
        resource?.type,
        normalisedPath,
      ),
      disallowed: false,
      required: false,
      rules,
    };
  }

  for (const specification of specifications || []) {
    for (const rule of specification.rules || []) {
      if (!("entityType" in rule) || !("path" in rule)) continue;
      if (rule.entityType !== resource.type) continue;
      if (!specificationPathEquals(rule.path, normalisedPath)) continue;

      rules.push(rule);

      if (rule.type === "disallow-property") {
        disallowed = true;
      }

      if (rule.type === "require-non-empty") {
        required = true;
      }

      if (rule.type === "fixed-value" && !fixedValueRule) {
        fixedValue = rule.value;
        fixedValueRule = rule;
        required = true;
      }
    }
  }

  return {
    entityType: resource.type as SpecificationEntityType,
    path: normalisedPath,
    label: getTerminologyLabel(specifications, resource.type, normalisedPath),
    disallowed,
    required,
    fixedValue,
    fixedValueRule,
    rules,
  };
}

export function evaluateSpecifications(
  specifications: ManifestEditorSpecification[] | undefined,
  vault: Vault,
  rootRef: Reference,
): SpecificationReport {
  const resolvedSpecifications = specifications || [];
  const resources = collectSpecificationResources(vault, rootRef);
  const results: SpecificationReportItem[] = [];

  for (const specification of resolvedSpecifications) {
    for (const [ruleIndex, rule] of (specification.rules || []).entries()) {
      results.push(
        ...evaluateRule(specification, rule, ruleIndex, resources, vault),
      );
    }
  }

  return {
    specifications: resolvedSpecifications,
    results,
    counts: countResults(results),
  };
}

export function collectSpecificationResources(
  vault: Vault,
  rootRef: Reference,
): CollectedResource[] {
  const collected: CollectedResource[] = [];
  const seen = new Set<string>();

  function addResource(input: unknown) {
    const ref = toReference(input);
    if (!ref) return;

    if (ref.type === "SpecificResource") {
      addResource((input as any)?.source);
      return;
    }

    const resource =
      resolveResource(vault, input) || resolveResource(vault, ref);
    if (!resource || !resource.type) return;

    const key = `${resource.type}:${resource.id || JSON.stringify(ref)}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (entityTypes.has(resource.type)) {
      collected.push({
        ref: { id: resource.id, type: resource.type },
        resource,
      });
    }

    for (const child of getResourceChildren(resource)) {
      addResource(child);
    }
  }

  addResource(rootRef);

  return collected;
}

function evaluateRule(
  specification: ManifestEditorSpecification,
  rule: SpecificationRule,
  ruleIndex: number,
  resources: CollectedResource[],
  vault: Vault,
): SpecificationReportItem[] {
  switch (rule.type) {
    case "disallow-property":
    case "require-non-empty":
    case "fixed-value":
      return evaluatePropertyRule(specification, rule, ruleIndex, resources);
    case "iiif:canvas-with-image-service":
      return [
        evaluateCanvasWithImageService(
          specification,
          rule,
          ruleIndex,
          resources,
          vault,
        ),
      ];
    case "iiif:thumbnail-from-body-service":
      return evaluateThumbnailFromBodyService(
        specification,
        rule,
        ruleIndex,
        resources,
        vault,
      );
    case "iiif:valid-rights":
      return evaluateValidRights(specification, rule, ruleIndex, resources);
    case "iiif:required-statement":
      return evaluateRequiredStatement(
        specification,
        rule,
        ruleIndex,
        resources,
      );
    case "iiif:metadata-template":
      return evaluateMetadataTemplate(
        specification,
        rule,
        ruleIndex,
        resources,
      );
    default:
      return [];
  }
}

function evaluatePropertyRule(
  specification: ManifestEditorSpecification,
  rule: Extract<
    SpecificationRule,
    { entityType: SpecificationEntityType; path: SpecificationPropertyPath }
  >,
  ruleIndex: number,
  resources: CollectedResource[],
): SpecificationReportItem[] {
  const targets = resources.filter((item) => item.ref.type === rule.entityType);
  const displayLabel = getTerminologyLabel(
    specification ? [specification] : [],
    rule.entityType,
    rule.path,
  );

  if (!targets.length) {
    return [
      createReportItem(specification, rule, ruleIndex, {
        status: "not-applicable",
        displayLabel,
        message: `No ${rule.entityType} resources were found for ${displayLabel}.`,
        path: rule.path,
      }),
    ];
  }

  return targets.map(({ ref, resource }) => {
    const value = getValueAtPath(resource, rule.path);
    const hasValue = hasMeaningfulValue(value);

    if (rule.type === "disallow-property") {
      return createReportItem(specification, rule, ruleIndex, {
        target: ref,
        path: rule.path,
        status: hasValue ? "disallowed" : "satisfied",
        displayLabel,
        actual: value,
        message: hasValue
          ? `${displayLabel} is present but is not allowed.`
          : `${displayLabel} is not present.`,
        editorTarget: createEditorTarget(ref, rule.path),
      });
    }

    if (rule.type === "require-non-empty") {
      return createReportItem(specification, rule, ruleIndex, {
        target: ref,
        path: rule.path,
        status: hasValue ? "satisfied" : "missing",
        displayLabel,
        actual: value,
        message: hasValue
          ? `${displayLabel} has a value.`
          : `${displayLabel} must be filled in.`,
        editorTarget: createEditorTarget(ref, rule.path),
      });
    }

    const matches = specificationJsonEquals(value, rule.value);
    return createReportItem(specification, rule, ruleIndex, {
      target: ref,
      path: rule.path,
      status: matches ? "satisfied" : hasValue ? "invalid" : "missing",
      displayLabel,
      expected: rule.value,
      actual: value,
      message: matches
        ? `${displayLabel} matches the required value.`
        : hasValue
          ? `${displayLabel} does not match the required value.`
          : `${displayLabel} must use the required value.`,
      editorTarget: createEditorTarget(ref, rule.path),
    });
  });
}

function evaluateCanvasWithImageService(
  specification: ManifestEditorSpecification,
  rule: Extract<SpecificationRule, { type: "iiif:canvas-with-image-service" }>,
  ruleIndex: number,
  resources: CollectedResource[],
  vault: Vault,
): SpecificationReportItem {
  const canvases = resources.filter((item) => item.ref.type === "Canvas");
  const expected = getExpectedServiceIds(rule);
  const matchingCanvas = canvases.find(({ resource }) => {
    const serviceIds = getCanvasPaintingServiceIds(resource, vault);
    return serviceMatches(serviceIds, expected);
  });

  return createReportItem(specification, rule, ruleIndex, {
    target: matchingCanvas?.ref,
    status: matchingCanvas ? "satisfied" : "missing",
    displayLabel: rule.label || "Canvas image service",
    expected,
    message: matchingCanvas
      ? "A canvas contains the required image service."
      : expected.length
        ? `A canvas must contain one of the required image services: ${expected.join(", ")}.`
        : "A canvas must contain a painting body with an image service.",
    editorTarget: matchingCanvas
      ? createEditorTarget(matchingCanvas.ref, ["items"])
      : undefined,
  });
}

function evaluateThumbnailFromBodyService(
  specification: ManifestEditorSpecification,
  rule: Extract<
    SpecificationRule,
    { type: "iiif:thumbnail-from-body-service" }
  >,
  ruleIndex: number,
  resources: CollectedResource[],
  vault: Vault,
): SpecificationReportItem[] {
  const entityType = rule.entityType || "Canvas";
  const targets = resources.filter((item) => item.ref.type === entityType);

  if (!targets.length) {
    return [
      createReportItem(specification, rule, ruleIndex, {
        status: "not-applicable",
        displayLabel: "Thumbnail",
        message: `No ${entityType} resources were found for thumbnail checks.`,
      }),
    ];
  }

  return targets.map(({ ref, resource }) => {
    const bodyServiceIds =
      entityType === "Manifest"
        ? resources
            .filter((item) => item.ref.type === "Canvas")
            .flatMap((item) =>
              getCanvasPaintingServiceIds(item.resource, vault),
            )
        : getCanvasPaintingServiceIds(resource, vault);
    const thumbnailMatches = thumbnailUsesBodyService(
      resource,
      bodyServiceIds,
      vault,
    );
    const hasThumbnail = hasMeaningfulValue(resource.thumbnail);

    return createReportItem(specification, rule, ruleIndex, {
      target: ref,
      path: ["thumbnail"],
      status: thumbnailMatches
        ? "satisfied"
        : !bodyServiceIds.length
          ? "not-applicable"
          : hasThumbnail
            ? "invalid"
            : rule.requireThumbnail === false
              ? "not-applicable"
              : "missing",
      displayLabel: getTerminologyLabel(
        [specification],
        ref.type,
        ["thumbnail"],
        "Thumbnail",
      ),
      expected: bodyServiceIds,
      actual: resource.thumbnail,
      message: thumbnailMatches
        ? "Thumbnail uses the same image service as the painting content."
        : !bodyServiceIds.length
          ? "No painting image service was found to compare against."
          : hasThumbnail
            ? "Thumbnail does not use the same image service as the painting content."
            : "Thumbnail must be created from the painting image service.",
      editorTarget: createEditorTarget(ref, ["thumbnail"]),
    });
  });
}

function evaluateValidRights(
  specification: ManifestEditorSpecification,
  rule: Extract<SpecificationRule, { type: "iiif:valid-rights" }>,
  ruleIndex: number,
  resources: CollectedResource[],
): SpecificationReportItem[] {
  const entityType = rule.entityType || "Manifest";
  const targets = resources.filter((item) => item.ref.type === entityType);
  const allowed = rule.allowed || [];

  return targets.map(({ ref, resource }) => {
    const value = resource.rights;
    const hasValue = hasMeaningfulValue(value);
    const valid =
      typeof value === "string" &&
      allowed.map(normaliseRights).includes(normaliseRights(value));

    return createReportItem(specification, rule, ruleIndex, {
      target: ref,
      path: ["rights"],
      status: valid
        ? "satisfied"
        : !hasValue && rule.required !== false
          ? "missing"
          : "invalid",
      displayLabel: getTerminologyLabel(
        [specification],
        ref.type,
        ["rights"],
        "Rights",
      ),
      expected: allowed,
      actual: value,
      message: valid
        ? "Rights uses an allowed URI."
        : !hasValue && rule.required !== false
          ? "Rights must use an allowed URI."
          : "Rights is not one of the allowed URIs.",
      editorTarget: createEditorTarget(ref, ["rights"]),
    });
  });
}

function evaluateRequiredStatement(
  specification: ManifestEditorSpecification,
  rule: Extract<SpecificationRule, { type: "iiif:required-statement" }>,
  ruleIndex: number,
  resources: CollectedResource[],
): SpecificationReportItem[] {
  const entityType = rule.entityType || "Manifest";
  const targets = resources.filter((item) => item.ref.type === entityType);

  return targets.map(({ ref, resource }) => {
    const requiredStatement = resource.requiredStatement;
    const labelMatches = rule.label
      ? textValueMatches(requiredStatement?.label, rule.label)
      : hasMeaningfulValue(requiredStatement?.label);
    const mustHaveValue = rule.value || rule.valueRequired !== false;
    const valueMatches = rule.value
      ? textValueMatches(requiredStatement?.value, rule.value)
      : !mustHaveValue || hasMeaningfulValue(requiredStatement?.value);
    const hasStatement = hasMeaningfulValue(requiredStatement);

    return createReportItem(specification, rule, ruleIndex, {
      target: ref,
      path: ["requiredStatement"],
      status:
        labelMatches && valueMatches
          ? "satisfied"
          : hasStatement
            ? "invalid"
            : "missing",
      displayLabel: getTerminologyLabel(
        [specification],
        ref.type,
        ["requiredStatement"],
        "Required statement",
      ),
      expected: rule.value || rule.label,
      actual: requiredStatement,
      message:
        labelMatches && valueMatches
          ? "Required statement is complete."
          : hasStatement
            ? "Required statement does not match the specification."
            : "Required statement must be filled in.",
      editorTarget: createEditorTarget(ref, ["requiredStatement"]),
    });
  });
}

function evaluateMetadataTemplate(
  specification: ManifestEditorSpecification,
  rule: Extract<SpecificationRule, { type: "iiif:metadata-template" }>,
  ruleIndex: number,
  resources: CollectedResource[],
): SpecificationReportItem[] {
  const entityType = rule.entityType || "Manifest";
  const targets = resources.filter((item) => item.ref.type === entityType);
  const results: SpecificationReportItem[] = [];

  for (const { ref, resource } of targets) {
    const metadata = Array.isArray(resource.metadata) ? resource.metadata : [];

    rule.items.forEach((template, itemIndex) => {
      const matchingItem = metadata.find((item: any) =>
        textValueMatches(item?.label, template.label),
      );
      const hasRequiredValue = template.value
        ? textValueMatches(matchingItem?.value, template.value)
        : template.valueRequired
          ? hasMeaningfulValue(matchingItem?.value)
          : true;
      const status: SpecificationReportStatus =
        matchingItem && hasRequiredValue
          ? "satisfied"
          : matchingItem && template.value
            ? "invalid"
            : "missing";
      const label = textValueToDisplay(template.label);

      results.push(
        createReportItem(specification, rule, ruleIndex, {
          idSuffix: `metadata-${itemIndex}`,
          target: ref,
          path: ["metadata"],
          status,
          displayLabel: label || "Metadata",
          expected: template.value || template.label,
          actual: matchingItem,
          message:
            matchingItem && hasRequiredValue
              ? `${label || "Metadata"} is present.`
              : matchingItem
                ? `${label || "Metadata"} needs a value.`
                : `${label || "Metadata"} metadata must be added.`,
          editorTarget: createEditorTarget(ref, ["metadata"]),
        }),
      );
    });
  }

  return results;
}

function createReportItem(
  specification: ManifestEditorSpecification,
  rule: SpecificationRule,
  ruleIndex: number,
  options: {
    idSuffix?: string;
    target?: Reference;
    path?: SpecificationPropertyPath;
    status: SpecificationReportStatus;
    displayLabel: string;
    message: string;
    expected?: SpecificationReportItem["expected"];
    actual?: unknown;
    editorTarget?: SpecificationEditorTarget;
  },
): SpecificationReportItem {
  const ruleId = rule.id || `${rule.type}-${ruleIndex}`;
  const suffix = options.idSuffix ? `-${options.idSuffix}` : "";

  return {
    id: `${specification.id}-${ruleId}-${options.target?.type || "root"}-${options.target?.id || "none"}${suffix}`,
    specificationId: specification.id,
    specificationLabel: specification.label,
    ruleId,
    ruleType: rule.type,
    ruleLabel: rule.label || options.displayLabel,
    ruleIndex,
    target: options.target,
    path: options.path,
    status: options.status,
    displayLabel: options.displayLabel,
    message: rule.message || options.message,
    expected: options.expected,
    actual: options.actual,
    editorTarget: options.editorTarget,
  };
}

function createEditorTarget(
  resource: Reference,
  propertyPath: SpecificationPropertyPath,
): SpecificationEditorTarget {
  const firstProperty = propertyPath[0];
  return {
    resource,
    propertyPath,
    selectedTab:
      firstProperty === "metadata"
        ? "@manifest-editor/metadata"
        : firstProperty && descriptiveProperties.has(firstProperty)
          ? "@manifest-editor/descriptive-properties"
          : undefined,
  };
}

function countResults(
  results: SpecificationReportItem[],
): Record<SpecificationReportStatus, number> {
  const counts = { ...emptyCounts };
  for (const result of results) {
    counts[result.status] += 1;
  }
  return counts;
}

function resolveResource(vault: Vault, input: any) {
  const ref = toReference(input);
  if (!ref) return input;

  try {
    return vault.get(ref as any, { skipSelfReturn: false } as any) || input;
  } catch {
    try {
      return vault.get(ref as any) || input;
    } catch {
      return input;
    }
  }
}

function toReference(input: any): Reference | null {
  if (!input || typeof input !== "object") return null;
  if (input.type === "SpecificResource")
    return {
      id: input.id || input.source?.id || "",
      type: "SpecificResource" as any,
    };
  if (typeof input.id === "string" && typeof input.type === "string") {
    return { id: input.id, type: input.type };
  }
  return null;
}

function getResourceChildren(resource: any): unknown[] {
  if (!resource || typeof resource !== "object") return [];

  const children: unknown[] = [];
  for (const key of [
    "items",
    "structures",
    "annotations",
    "thumbnail",
    "provider",
    "homepage",
    "rendering",
    "seeAlso",
    "body",
    "target",
    "source",
  ]) {
    const value = resource[key];
    if (Array.isArray(value)) {
      children.push(...value);
    } else if (value) {
      children.push(value);
    }
  }

  return children;
}

function getExpectedServiceIds(rule: {
  serviceId?: string;
  serviceIds?: string[];
}) {
  return [
    ...(rule.serviceIds || []),
    ...(rule.serviceId ? [rule.serviceId] : []),
  ].filter(Boolean);
}

function serviceMatches(actual: string[], expected: string[]) {
  const actualSet = new Set(actual.filter(Boolean));
  if (!expected.length) return actualSet.size > 0;
  return expected.some((serviceId) => actualSet.has(serviceId));
}

function getCanvasPaintingServiceIds(canvas: any, vault: Vault): string[] {
  const pages = resolveReferenceList(vault, canvas?.items);
  const serviceIds: string[] = [];

  for (const page of pages) {
    const annotations = resolveReferenceList(vault, page?.items);
    for (const annotation of annotations) {
      const motivation = Array.isArray(annotation?.motivation)
        ? annotation.motivation
        : [annotation?.motivation];
      if (!motivation.includes("painting")) continue;
      for (const body of normaliseBodies(annotation?.body, vault)) {
        serviceIds.push(...getImageServiceIds(body));
      }
    }
  }

  return Array.from(new Set(serviceIds));
}

function thumbnailUsesBodyService(
  resource: any,
  bodyServiceIds: string[],
  vault: Vault,
) {
  const thumbnails = resolveReferenceList(vault, resource?.thumbnail);
  if (!thumbnails.length || !bodyServiceIds.length) return false;

  for (const thumbnail of thumbnails) {
    const thumbnailServiceIds = getImageServiceIds(thumbnail);
    const thumbnailId = typeof thumbnail?.id === "string" ? thumbnail.id : "";

    if (
      thumbnailServiceIds.some((serviceId) =>
        bodyServiceIds.includes(serviceId),
      )
    ) {
      return true;
    }

    if (bodyServiceIds.some((serviceId) => thumbnailId.startsWith(serviceId))) {
      return true;
    }
  }

  return false;
}

function normaliseBodies(body: any, vault: Vault): any[] {
  const resolved = resolveResource(vault, body);
  if (!resolved) return [];
  if (Array.isArray(resolved))
    return resolved.flatMap((item) => normaliseBodies(item, vault));
  if (resolved.type === "SpecificResource")
    return normaliseBodies(resolved.source, vault);
  if (resolved.type === "Choice")
    return (
      resolved.items?.flatMap((item: any) => normaliseBodies(item, vault)) || []
    );
  return [resolved];
}

function getImageServiceIds(resource: any): string[] {
  const service = resource?.service || resource?.services;
  const services = Array.isArray(service) ? service : service ? [service] : [];
  const ids: string[] = [];

  for (const item of services) {
    const id = typeof item === "string" ? item : item?.id || item?.["@id"];
    if (typeof id === "string" && id) {
      ids.push(id);
    }
  }

  return Array.from(new Set(ids));
}

function resolveReferenceList(vault: Vault, value: any): any[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];

  try {
    const resolved = vault.get(list as any);
    if (Array.isArray(resolved)) {
      return resolved.filter(Boolean);
    }
  } catch {
    // Fall through to resolving each item.
  }

  return list.map((item) => resolveResource(vault, item)).filter(Boolean);
}

function normaliseRights(value: string) {
  return value.replace(/^https:/, "http:").replace(/\/?$/, "/");
}

function textValueMatches(
  actual: unknown,
  expected: SpecificationTextValue,
): boolean {
  if (typeof expected === "string") {
    return textValues(actual).some((value) => value === expected);
  }
  return specificationJsonEquals(actual, expected);
}

function textValues(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  if (Array.isArray(value)) {
    return value.flatMap(textValues);
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(textValues);
  }
  return [];
}

function textValueToDisplay(value: SpecificationTextValue) {
  if (typeof value === "string") return value;
  return textValues(value)[0] || "";
}

function humanisePath(path: SpecificationPropertyPath) {
  const value = path[path.length - 1] || "Property";
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
