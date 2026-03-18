import type { ManifestEditorToolJsonSchema } from "../types";

export interface ToolValidationIssue {
  path: string;
  message: string;
  expected?: unknown;
  received?: unknown;
  allowedValues?: unknown[];
  schemaFragment?: unknown;
}

export function createResourceRefSchema(options: {
  description?: string;
} = {}): ManifestEditorToolJsonSchema {
  return {
    type: "object",
    additionalProperties: false,
    required: ["id", "type"],
    properties: {
      id: { type: "string" },
      type: { type: "string" },
    },
    ...(options.description ? { description: options.description } : {}),
  };
}

export const anyObjectSchema: ManifestEditorToolJsonSchema = {
  type: "object",
  additionalProperties: true,
};

export const languageMapSchema: ManifestEditorToolJsonSchema = {
  type: "object",
  description: "IIIF language map object.",
};

export const languageMapLikeSchema: ManifestEditorToolJsonSchema = {
  oneOf: [
    {
      type: "string",
      description: "Convenience shorthand. Plain strings are treated as English language-map values.",
    },
    languageMapSchema,
  ],
};

export const selectorSchema: ManifestEditorToolJsonSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: false,
      required: ["type"],
      properties: {
        type: {
          type: "string",
          enum: ["whole_canvas"],
        },
      },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "x", "y", "width", "height"],
      properties: {
        type: {
          type: "string",
          enum: ["xywh"],
        },
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "value"],
      properties: {
        type: {
          type: "string",
          enum: ["svg"],
        },
        value: { type: "string" },
      },
    },
  ],
};

export const metadataPatchSchema: ManifestEditorToolJsonSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "label", "value"],
      properties: {
        type: {
          type: "string",
          enum: ["add"],
        },
        label: languageMapLikeSchema,
        value: languageMapLikeSchema,
        beforeIndex: {
          type: "number",
        },
      },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "index", "label", "value"],
      properties: {
        type: {
          type: "string",
          enum: ["update"],
        },
        index: {
          type: "number",
        },
        label: languageMapLikeSchema,
        value: languageMapLikeSchema,
      },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "index"],
      properties: {
        type: {
          type: "string",
          enum: ["delete"],
        },
        index: {
          type: "number",
        },
      },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["type", "startIndex", "endIndex"],
      properties: {
        type: {
          type: "string",
          enum: ["reorder"],
        },
        startIndex: {
          type: "number",
        },
        endIndex: {
          type: "number",
        },
      },
    },
  ],
};

export const propertyPatchSchema: ManifestEditorToolJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["property", "value"],
  properties: {
    property: { type: "string" },
    value: {},
  },
};

export function createJsonSchemaValidator(schema: ManifestEditorToolJsonSchema) {
  return (input: unknown) => validateSchema(schema, input, "$");
}

function getValueType(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function appendPath(base: string, key: string | number) {
  if (typeof key === "number") {
    return `${base}[${key}]`;
  }

  return base === "$" ? `$.${key}` : `${base}.${key}`;
}

function validateType(type: string, value: unknown) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return !!value && typeof value === "object" && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
    case "null":
      return value === null;
    default:
      return true;
  }
}

function validateSchema(
  schema: ManifestEditorToolJsonSchema | undefined,
  value: unknown,
  path: string,
): ToolValidationIssue[] {
  if (!schema || typeof schema !== "object") {
    return [];
  }

  const issues: ToolValidationIssue[] = [];
  const resolvedSchema = schema as Record<string, any>;

  if (Array.isArray(resolvedSchema.enum) && !resolvedSchema.enum.includes(value)) {
    issues.push({
      path,
      message: "Value must be one of the allowed enum values",
      expected: "enum",
      received: value,
      allowedValues: resolvedSchema.enum,
      schemaFragment: resolvedSchema,
    });
    return issues;
  }

  if (Object.prototype.hasOwnProperty.call(resolvedSchema, "const") && resolvedSchema.const !== value) {
    issues.push({
      path,
      message: "Value must match the expected constant",
      expected: resolvedSchema.const,
      received: value,
      schemaFragment: resolvedSchema,
    });
    return issues;
  }

  if (resolvedSchema.type) {
    const allowedTypes = Array.isArray(resolvedSchema.type) ? resolvedSchema.type : [resolvedSchema.type];
    const typeMatch = allowedTypes.some((type) => validateType(type, value));

    if (!typeMatch) {
      issues.push({
        path,
        message: "Value does not match the expected type",
        expected: allowedTypes,
        received: getValueType(value),
        schemaFragment: resolvedSchema,
      });
      return issues;
    }
  }

  if (resolvedSchema.oneOf) {
    const branches = Array.isArray(resolvedSchema.oneOf) ? resolvedSchema.oneOf : [];
    const branchResults = branches.map((branch) => validateSchema(branch, value, path));
    const matchingBranches = branchResults.filter((branchIssues) => branchIssues.length === 0);

    if (matchingBranches.length !== 1) {
      issues.push({
        path,
        message:
          matchingBranches.length === 0
            ? "Value does not match any allowed input shape"
            : "Value matches multiple conflicting input shapes",
        expected: "oneOf",
        received: value,
        allowedValues: branches.map((_, index) => index),
        schemaFragment: resolvedSchema,
      });

      if (matchingBranches.length === 0) {
        const bestBranch = branchResults
          .slice()
          .sort((left, right) => left.length - right.length)[0];
        if (bestBranch?.length) {
          issues.push(...bestBranch);
        }
      }

      return issues;
    }
  }

  if (Array.isArray(value)) {
    if (typeof resolvedSchema.minItems === "number" && value.length < resolvedSchema.minItems) {
      issues.push({
        path,
        message: `Array must contain at least ${resolvedSchema.minItems} item(s)`,
        expected: resolvedSchema.minItems,
        received: value.length,
        schemaFragment: resolvedSchema,
      });
    }

    if (resolvedSchema.items) {
      value.forEach((item, index) => {
        issues.push(...validateSchema(resolvedSchema.items, item, appendPath(path, index)));
      });
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;
    const properties = resolvedSchema.properties as Record<string, ManifestEditorToolJsonSchema> | undefined;
    const required = Array.isArray(resolvedSchema.required) ? resolvedSchema.required : [];

    for (const property of required) {
      if (!Object.prototype.hasOwnProperty.call(objectValue, property)) {
        issues.push({
          path: appendPath(path, property),
          message: "Required property is missing",
          expected: "present",
          received: "missing",
          schemaFragment: resolvedSchema,
        });
      }
    }

    if (properties) {
      for (const [key, propertySchema] of Object.entries(properties)) {
        if (!Object.prototype.hasOwnProperty.call(objectValue, key)) {
          continue;
        }

        issues.push(...validateSchema(propertySchema, objectValue[key], appendPath(path, key)));
      }
    }

    if (resolvedSchema.additionalProperties === false && properties) {
      for (const key of Object.keys(objectValue)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          issues.push({
            path: appendPath(path, key),
            message: "Unexpected property",
            expected: Object.keys(properties),
            received: key,
            schemaFragment: resolvedSchema,
          });
        }
      }
    }
  }

  return issues;
}
