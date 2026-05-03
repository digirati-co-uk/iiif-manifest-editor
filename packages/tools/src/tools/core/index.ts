import {
  addReferenceToList,
  createMutationResultData,
  createSuccess,
  createWithCreator,
  ensureNonEmptyArray,
  getResource,
  getResourceCapabilities,
  listVaultResources,
  removeReferenceFromList,
  reorderReferenceList,
  resolveResourceRef,
  searchVaultResources,
  toolError,
  updateMetadata,
  updateSingleProperties,
} from "../../runtime/helpers";
import type { ManifestEditorToolDefinition } from "../../types";
import {
  anyObjectSchema,
  createResourceRefSchema,
  metadataPatchSchema,
  propertyPatchSchema,
} from "../../runtime/schema";

const resourceRefSchema = createResourceRefSchema();

export function buildCoreToolRegistry(): ManifestEditorToolDefinition[] {
  return [
    {
      name: "me_get_root",
      modelExposure: "default",
      description: "Return the root IIIF resource currently being edited.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      execute(runtime) {
        const { entity } = getResource(runtime, runtime.rootResource);
        return createSuccess("me_get_root", "Loaded root resource", {
          data: {
            mode: runtime.mode,
            rootResource: runtime.rootResource,
            resource: entity,
          },
        });
      },
    },
    {
      name: "me_get_resource",
      modelExposure: "default",
      description: "Fetch a single IIIF resource from the current Vault.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource"],
        properties: {
          resource: resourceRefSchema,
        },
      },
      execute(runtime, input: any) {
        const { ref, entity } = getResource(runtime, input.resource);
        return createSuccess("me_get_resource", `Loaded ${ref.type} ${ref.id}`, {
          data: {
            resource: entity,
          },
        });
      },
    },
    {
      name: "me_list_resources",
      modelExposure: "default",
      description: "List resources in the current Vault, optionally filtered by type or id.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          types: {
            type: "array",
            items: { type: "string" },
          },
          ids: {
            type: "array",
            items: { type: "string" },
          },
          limit: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const resources = listVaultResources(runtime, input || {});
        return createSuccess("me_list_resources", `Listed ${resources.length} resources`, {
          data: {
            resources,
          },
        });
      },
    },
    {
      name: "me_search_resources",
      modelExposure: "default",
      description: "Search resources in the current Vault by id, type, or label text.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["query"],
        properties: {
          query: { type: "string" },
          types: {
            type: "array",
            items: { type: "string" },
          },
          limit: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const resources = searchVaultResources(runtime, input.query, input);
        return createSuccess("me_search_resources", `Found ${resources.length} matching resources`, {
          data: {
            resources,
          },
        });
      },
    },
    {
      name: "me_get_resource_capabilities",
      modelExposure: "default",
      description:
        "Describe which properties, creator-backed fields, and curated workflows are available for a resource.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource"],
        properties: {
          resource: resourceRefSchema,
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        const capabilities = getResourceCapabilities(runtime, resource);
        return createSuccess(
          "me_get_resource_capabilities",
          `Loaded capabilities for ${resource.type} ${resource.id}`,
          {
            data: capabilities,
          },
        );
      },
    },
    {
      name: "me_update_resource_properties",
      modelExposure: "default",
      description:
        "Update non-list properties on a resource, including language maps, technical fields, linking fields, and extensions.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "patches"],
        properties: {
          resource: resourceRefSchema,
          patches: {
            type: "array",
            minItems: 1,
            items: propertyPatchSchema,
          },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        const patches = input.patches || [];
        ensureNonEmptyArray(patches, "me_update_resource_properties requires at least one property patch");
        updateSingleProperties(runtime, resource, patches);
        return createSuccess("me_update_resource_properties", `Updated ${resource.type} ${resource.id}`, {
          changedRefs: [resource],
          data: createMutationResultData({
            normalizedInput: {
              resource,
              patches,
            },
            primaryRef: resource,
            extra: {
              patches,
            },
          }),
        });
      },
    },
    {
      name: "me_update_metadata",
      modelExposure: "default",
      description:
        "Apply add, update, delete, or reorder operations to a resource's metadata array. Pass a non-empty patches array. For bulk additions, include multiple add patches in one call. Clearly marked synthetic test metadata is acceptable when the user is testing the editor.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "patches"],
        properties: {
          resource: resourceRefSchema,
          patches: {
            type: "array",
            minItems: 1,
            items: metadataPatchSchema,
            description:
              "Metadata operations to apply. Use type add with label and value to append new metadata pairs.",
            examples: [
              [
                {
                  type: "add",
                  label: "Test field 1",
                  value: "Sample value 1",
                },
                {
                  type: "add",
                  label: "Test field 2",
                  value: "Sample value 2",
                },
              ],
            ],
          },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        const patches = input.patches || [];
        if (!patches.length) {
          throw toolError("INVALID_INPUT", "me_update_metadata requires at least one metadata patch");
        }
        updateMetadata(runtime, resource, patches);
        const { entity } = getResource(runtime, resource);
        return createSuccess("me_update_metadata", `Updated metadata on ${resource.type} ${resource.id}`, {
          changedRefs: [resource],
          data: createMutationResultData({
            normalizedInput: {
              resource,
              patches,
            },
            primaryRef: resource,
            extra: {
              patches,
              metadataCount: Array.isArray((entity as any).metadata) ? (entity as any).metadata.length : 0,
              metadata: Array.isArray((entity as any).metadata) ? (entity as any).metadata : [],
            },
          }),
        });
      },
    },
    {
      name: "me_add_reference",
      modelExposure: "fallback",
      description: "Add an existing resource reference to a list property on a resource.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "property", "reference"],
        properties: {
          resource: resourceRefSchema,
          property: { type: "string" },
          reference: resourceRefSchema,
          index: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        const reference = resolveResourceRef(runtime, input.reference);
        addReferenceToList(runtime, resource, input.property, reference, input.index);
        return createSuccess(
          "me_add_reference",
          `Added ${reference.type} ${reference.id} to ${resource.type}.${input.property}`,
          {
            changedRefs: [resource],
            data: createMutationResultData({
              normalizedInput: {
                resource,
                property: input.property,
                reference,
                index: input.index,
              },
              primaryRef: resource,
              extra: {
                reference,
              },
            }),
          },
        );
      },
    },
    {
      name: "me_remove_reference",
      modelExposure: "fallback",
      description: "Remove an item from a list property on a resource by index or resource reference.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "property"],
        oneOf: [
          { required: ["index"] },
          { required: ["reference"] },
        ],
        properties: {
          resource: resourceRefSchema,
          property: { type: "string" },
          index: { type: "number" },
          reference: resourceRefSchema,
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        const reference = input.reference ? resolveResourceRef(runtime, input.reference) : undefined;
        removeReferenceFromList(runtime, resource, input.property, {
          index: input.index,
          reference,
        });
        return createSuccess("me_remove_reference", `Updated ${resource.type}.${input.property}`, {
          changedRefs: [resource],
          data: createMutationResultData({
            normalizedInput: {
              resource,
              property: input.property,
              ...(typeof input.index === "number" ? { index: input.index } : {}),
              ...(reference ? { reference } : {}),
            },
            primaryRef: resource,
          }),
        });
      },
    },
    {
      name: "me_reorder_references",
      modelExposure: "fallback",
      description: "Reorder items within a list property on a resource.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "property", "startIndex", "endIndex"],
        properties: {
          resource: resourceRefSchema,
          property: { type: "string" },
          startIndex: { type: "number" },
          endIndex: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        reorderReferenceList(runtime, resource, input.property, input.startIndex, input.endIndex);
        return createSuccess("me_reorder_references", `Reordered ${resource.type}.${input.property}`, {
          changedRefs: [resource],
          data: createMutationResultData({
            normalizedInput: {
              resource,
              property: input.property,
              startIndex: input.startIndex,
              endIndex: input.endIndex,
            },
            primaryRef: resource,
          }),
        });
      },
    },
    {
      name: "me_create_resource",
      modelExposure: "fallback",
      description:
        "Create a resource using the active creator registry, then attach it to a parent property in the Vault.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["parent", "property", "targetType"],
        properties: {
          parent: resourceRefSchema,
          property: { type: "string" },
          targetType: { type: "string" },
          creatorId: { type: "string" },
          filter: { type: "string" },
          index: { type: "number" },
          target: resourceRefSchema,
          payload: anyObjectSchema,
          initialData: anyObjectSchema,
          isPainting: { type: "boolean" },
          onlyReference: { type: "boolean" },
        },
      },
      async execute(runtime, input: any) {
        const created = await createWithCreator(runtime, input);
        const primaryRef = created.createdRefs[0] || null;
        return createSuccess(
          "me_create_resource",
          `Created ${created.createdRefs.length} resource(s) with ${created.creator.id}`,
          {
            changedRefs: created.target ? [created.parent, created.target] : [created.parent],
            createdRefs: created.createdRefs,
            data: createMutationResultData({
              normalizedInput: {
                parent: created.parent,
                property: input.property,
                targetType: input.targetType,
                creatorId: created.creator.id,
                filter: input.filter,
                index: input.index,
                ...(created.target ? { target: created.target } : {}),
                ...(input.payload ? { payload: input.payload } : {}),
                ...(input.initialData ? { initialData: input.initialData } : {}),
                ...(typeof input.isPainting === "boolean" ? { isPainting: input.isPainting } : {}),
                ...(typeof input.onlyReference === "boolean" ? { onlyReference: input.onlyReference } : {}),
              },
              primaryRef,
              extra: {
                creatorId: created.creator.id,
              },
            }),
          },
        );
      },
    },
  ];
}
