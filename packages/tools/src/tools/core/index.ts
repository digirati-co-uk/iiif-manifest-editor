import {
  addReferenceToList,
  createSuccess,
  createWithCreator,
  getResource,
  getResourceCapabilities,
  listVaultResources,
  removeReferenceFromList,
  reorderReferenceList,
  resolveResourceRef,
  searchVaultResources,
  updateMetadata,
  updateSingleProperties,
} from "../../runtime/helpers";
import type { ManifestEditorToolDefinition } from "../../types";

const resourceRefSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type"],
  properties: {
    id: { type: "string" },
    type: { type: "string" },
  },
};

export function buildCoreToolRegistry(): ManifestEditorToolDefinition[] {
  return [
    {
      name: "me_get_root",
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
            items: {
              type: "object",
              additionalProperties: false,
              required: ["property", "value"],
              properties: {
                property: { type: "string" },
                value: {},
              },
            },
          },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        updateSingleProperties(runtime, resource, input.patches || []);
        return createSuccess("me_update_resource_properties", `Updated ${resource.type} ${resource.id}`, {
          changedRefs: [resource],
        });
      },
    },
    {
      name: "me_update_metadata",
      description: "Apply add, update, delete, or reorder operations to a resource's metadata array.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "patches"],
        properties: {
          resource: resourceRefSchema,
          patches: {
            type: "array",
            items: { type: "object" },
          },
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        updateMetadata(runtime, resource, input.patches || []);
        return createSuccess("me_update_metadata", `Updated metadata on ${resource.type} ${resource.id}`, {
          changedRefs: [resource],
        });
      },
    },
    {
      name: "me_add_reference",
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
          },
        );
      },
    },
    {
      name: "me_remove_reference",
      description: "Remove an item from a list property on a resource by index or resource reference.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "property"],
        properties: {
          resource: resourceRefSchema,
          property: { type: "string" },
          index: { type: "number" },
          reference: resourceRefSchema,
        },
      },
      execute(runtime, input: any) {
        const resource = resolveResourceRef(runtime, input.resource);
        removeReferenceFromList(runtime, resource, input.property, {
          index: input.index,
          reference: input.reference,
        });
        return createSuccess("me_remove_reference", `Updated ${resource.type}.${input.property}`, {
          changedRefs: [resource],
        });
      },
    },
    {
      name: "me_reorder_references",
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
        });
      },
    },
    {
      name: "me_create_resource",
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
          payload: { type: "object" },
          initialData: { type: "object" },
          isPainting: { type: "boolean" },
          onlyReference: { type: "boolean" },
        },
      },
      async execute(runtime, input: any) {
        const created = await createWithCreator(runtime, input);
        return createSuccess(
          "me_create_resource",
          `Created ${created.createdRefs.length} resource(s) with ${created.creator.id}`,
          {
            changedRefs: created.target ? [created.parent, created.target] : [created.parent],
            createdRefs: created.createdRefs,
            data: {
              creatorId: created.creator.id,
            },
          },
        );
      },
    },
  ];
}
