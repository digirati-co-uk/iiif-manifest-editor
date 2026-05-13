import type { Reference } from "@iiif/presentation-3";

export type SpecificationEntityType =
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Range"
  | "AnnotationPage"
  | "Annotation"
  | "ContentResource"
  | "Agent";

export type SpecificationPropertyPath = string[];

export type SpecificationJsonValue =
  | null
  | string
  | number
  | boolean
  | SpecificationJsonValue[]
  | { [key: string]: SpecificationJsonValue };

export type SpecificationTextValue = string | { [language: string]: string[] };

export type SpecificationRuleBase = {
  id?: string;
  label?: string;
  description?: string;
  message?: string;
};

export type SpecificationPropertyRuleBase = SpecificationRuleBase & {
  entityType: SpecificationEntityType;
  path: SpecificationPropertyPath;
};

export type DisallowPropertySpecificationRule =
  SpecificationPropertyRuleBase & {
    type: "disallow-property";
  };

export type RequireNonEmptySpecificationRule = SpecificationPropertyRuleBase & {
  type: "require-non-empty";
};

export type FixedValueSpecificationRule = SpecificationPropertyRuleBase & {
  type: "fixed-value";
  value: SpecificationJsonValue;
};

export type CanvasWithImageServiceSpecificationRule = SpecificationRuleBase & {
  type: "iiif:canvas-with-image-service";
  serviceId?: string;
  serviceIds?: string[];
};

export type ThumbnailFromBodyServiceSpecificationRule =
  SpecificationRuleBase & {
    type: "iiif:thumbnail-from-body-service";
    entityType?: "Manifest" | "Canvas";
    requireThumbnail?: boolean;
  };

export type ValidRightsSpecificationRule = SpecificationRuleBase & {
  type: "iiif:valid-rights";
  entityType?: SpecificationEntityType;
  allowed: string[];
  required?: boolean;
};

export type RequiredStatementSpecificationRule = SpecificationRuleBase & {
  type: "iiif:required-statement";
  entityType?: SpecificationEntityType;
  label?: SpecificationTextValue;
  value?: SpecificationTextValue;
  valueRequired?: boolean;
};

export type MetadataTemplateSpecificationRule = SpecificationRuleBase & {
  type: "iiif:metadata-template";
  entityType?: SpecificationEntityType;
  items: Array<{
    label: SpecificationTextValue;
    value?: SpecificationTextValue;
    valueRequired?: boolean;
  }>;
};

export type SpecificationRule =
  | DisallowPropertySpecificationRule
  | RequireNonEmptySpecificationRule
  | FixedValueSpecificationRule
  | CanvasWithImageServiceSpecificationRule
  | ThumbnailFromBodyServiceSpecificationRule
  | ValidRightsSpecificationRule
  | RequiredStatementSpecificationRule
  | MetadataTemplateSpecificationRule;

export type ManifestEditorSpecification = {
  id: string;
  label: string;
  description?: string;
  version?: string;
  terminology?: {
    entities?: Partial<Record<SpecificationEntityType, string>>;
    properties?: Array<{
      entityType?: SpecificationEntityType;
      path: SpecificationPropertyPath;
      label: string;
    }>;
  };
  rules: SpecificationRule[];
};

export type SpecificationReportStatus =
  | "satisfied"
  | "missing"
  | "invalid"
  | "disallowed"
  | "not-applicable";

export type SpecificationEditorTarget = {
  resource: Reference;
  propertyPath?: SpecificationPropertyPath;
  selectedTab?: string;
};

export type SpecificationReportItem = {
  id: string;
  specificationId: string;
  specificationLabel: string;
  ruleId: string;
  ruleType: SpecificationRule["type"];
  ruleLabel: string;
  ruleIndex: number;
  target?: Reference;
  path?: SpecificationPropertyPath;
  status: SpecificationReportStatus;
  displayLabel: string;
  message: string;
  expected?: SpecificationJsonValue | SpecificationTextValue | string[];
  actual?: unknown;
  editorTarget?: SpecificationEditorTarget;
};

export type SpecificationReport = {
  specifications: ManifestEditorSpecification[];
  results: SpecificationReportItem[];
  counts: Record<SpecificationReportStatus, number>;
};

export type SpecificationPropertyPolicy = {
  entityType?: SpecificationEntityType;
  path: SpecificationPropertyPath;
  label?: string;
  disallowed: boolean;
  required: boolean;
  fixedValue?: SpecificationJsonValue;
  fixedValueRule?: FixedValueSpecificationRule;
  rules: SpecificationRule[];
};
