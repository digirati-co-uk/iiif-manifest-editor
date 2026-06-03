import type { Vault } from "@iiif/helpers/vault";
import { type CSSProperties, type SVGProps, useMemo } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";

export const TAGS_META_NAMESPACE = "@manifest-editor/tags";
export const TAGS_META_KEY = "tags";

export interface ManifestEditorTag {
  type: string;
  id: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}

export type ManifestEditorTagResource =
  | string
  | {
      id: string;
      type?: string;
    }
  | null
  | undefined;

export interface ManifestEditorTagGroupRow {
  key: string;
  type: string;
  id: string;
  tag: ManifestEditorTag;
  canvasIds: string[];
  canvasCount: number;
}

export interface ManifestEditorTagGroup {
  key: string;
  type: string;
  rows: ManifestEditorTagGroupRow[];
  canvasIds: string[];
  canvasCount: number;
  tagCount: number;
}

export const FLAG_TAG: ManifestEditorTag = {
  type: "flag",
  id: "flag",
  label: "Flag",
  backgroundColor: "#b91c1c",
  textColor: "#ffffff",
  icon: "flag",
};

const EMPTY_TAGS: ManifestEditorTag[] = [];

function getResourceId(resource: ManifestEditorTagResource) {
  return typeof resource === "string" ? resource : resource?.id || null;
}

function getTagType(tag: Pick<ManifestEditorTag, "type" | "id">) {
  return tag.type || tag.id;
}

function getTagKey(tag: Pick<ManifestEditorTag, "type" | "id">) {
  return `${tag.type}:${tag.id}`;
}

function normaliseTags(tags: ManifestEditorTag[] | undefined | null): ManifestEditorTag[] {
  if (!Array.isArray(tags)) {
    return EMPTY_TAGS;
  }

  const byType = new Map<string, ManifestEditorTag>();
  for (const tag of tags) {
    if (!tag?.id) {
      continue;
    }
    const type = getTagType(tag);
    byType.set(type, { ...tag, type });
  }

  return Array.from(byType.values());
}

function getTagLabel(tag: Pick<ManifestEditorTag, "label" | "id" | "type">) {
  return tag.label || tag.id || tag.type;
}

function isFlagTag(type: string, id?: string) {
  return type === FLAG_TAG.type && (!id || id === FLAG_TAG.id);
}

function compareTagRows(a: ManifestEditorTagGroupRow, b: ManifestEditorTagGroupRow) {
  if (isFlagTag(a.type, a.id)) return -1;
  if (isFlagTag(b.type, b.id)) return 1;
  return (
    getTagLabel(a.tag).localeCompare(getTagLabel(b.tag)) ||
    a.type.localeCompare(b.type) ||
    a.id.localeCompare(b.id)
  );
}

function compareTagGroups(a: ManifestEditorTagGroup, b: ManifestEditorTagGroup) {
  if (isFlagTag(a.type)) return -1;
  if (isFlagTag(b.type)) return 1;
  return a.type.localeCompare(b.type);
}

export function getResourceTags(vault: Vault, resource: ManifestEditorTagResource): ManifestEditorTag[] {
  const id = getResourceId(resource);
  if (!id) {
    return EMPTY_TAGS;
  }

  const meta = vault.getResourceMeta(id, TAGS_META_NAMESPACE) as { [TAGS_META_KEY]?: ManifestEditorTag[] } | undefined;
  return normaliseTags(meta?.[TAGS_META_KEY]);
}

export function getResourceTagsFromState(state: any, resource: ManifestEditorTagResource): ManifestEditorTag[] {
  const id = getResourceId(resource);
  if (!id) {
    return EMPTY_TAGS;
  }

  return normaliseTags(state?.iiif?.meta?.[id]?.[TAGS_META_NAMESPACE]?.[TAGS_META_KEY]);
}

export function setResourceTags(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tags: ManifestEditorTag[],
): ManifestEditorTag[] {
  const id = getResourceId(resource);
  if (!id) {
    return EMPTY_TAGS;
  }

  const nextTags = normaliseTags(tags);
  vault.setMetaValue([id, TAGS_META_NAMESPACE, TAGS_META_KEY], nextTags);
  return nextTags;
}

export function addResourceTag(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tag: ManifestEditorTag,
): ManifestEditorTag[] {
  return setResourceTags(vault, resource, [...getResourceTags(vault, resource), tag]);
}

export function getResourceTag(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tagType: string,
): ManifestEditorTag | undefined {
  return getResourceTags(vault, resource).find((tag) => tag.type === tagType);
}

export function removeResourceTag(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tagType: string,
  tagId?: string,
): ManifestEditorTag[] {
  return setResourceTags(
    vault,
    resource,
    getResourceTags(vault, resource).filter((tag) => tag.type !== tagType || (tagId ? tag.id !== tagId : false)),
  );
}

export function getResourceTagGroups(
  vault: Vault,
  resources: ManifestEditorTagResource[],
): ManifestEditorTagGroup[] {
  const groups = new Map<string, ManifestEditorTagGroup>();

  for (const resource of resources) {
    const resourceId = getResourceId(resource);
    if (!resourceId) {
      continue;
    }

    for (const tag of getResourceTags(vault, resource)) {
      const groupKey = tag.type;
      const rowKey = getTagKey(tag);
      let group = groups.get(groupKey);

      if (!group) {
        group = {
          key: groupKey,
          type: tag.type,
          rows: [],
          canvasIds: [],
          canvasCount: 0,
          tagCount: 0,
        };
        groups.set(groupKey, group);
      }

      let row = group.rows.find((item) => item.key === rowKey);
      if (!row) {
        row = {
          key: rowKey,
          type: tag.type,
          id: tag.id,
          tag,
          canvasIds: [],
          canvasCount: 0,
        };
        group.rows.push(row);
      }

      row.canvasIds.push(resourceId);
      row.canvasCount = row.canvasIds.length;
      group.tagCount += 1;
    }
  }

  for (const group of groups.values()) {
    group.rows.sort(compareTagRows);
    group.canvasIds = Array.from(new Set(group.rows.flatMap((row) => row.canvasIds)));
    group.canvasCount = group.canvasIds.length;
  }

  return Array.from(groups.values()).sort(compareTagGroups);
}

export function hasResourceTag(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tagType: string,
  tagId?: string,
): boolean {
  const tag = getResourceTag(vault, resource, tagType);
  return tagId ? tag?.id === tagId : !!tag;
}

export function toggleResourceTag(
  vault: Vault,
  resource: ManifestEditorTagResource,
  tag: ManifestEditorTag,
): ManifestEditorTag[] {
  return hasResourceTag(vault, resource, tag.type, tag.id)
    ? removeResourceTag(vault, resource, tag.type)
    : addResourceTag(vault, resource, tag);
}

export interface ManifestEditorTagsApi {
  getTags(resource: ManifestEditorTagResource): ManifestEditorTag[];
  setTags(resource: ManifestEditorTagResource, tags: ManifestEditorTag[]): ManifestEditorTag[];
  addTag(resource: ManifestEditorTagResource, tag: ManifestEditorTag): ManifestEditorTag[];
  upsertTag(resource: ManifestEditorTagResource, tag: ManifestEditorTag): ManifestEditorTag[];
  getTag(resource: ManifestEditorTagResource, tagType: string): ManifestEditorTag | undefined;
  removeTag(resource: ManifestEditorTagResource, tagType: string, tagId?: string): ManifestEditorTag[];
  hasTag(resource: ManifestEditorTagResource, tagType: string, tagId?: string): boolean;
  toggleTag(resource: ManifestEditorTagResource, tag: ManifestEditorTag): ManifestEditorTag[];
}

export function createManifestEditorTagsApi(vault: Vault): ManifestEditorTagsApi {
  return {
    getTags(resource) {
      return getResourceTags(vault, resource);
    },
    setTags(resource, tags) {
      return setResourceTags(vault, resource, tags);
    },
    addTag(resource, tag) {
      return addResourceTag(vault, resource, tag);
    },
    upsertTag(resource, tag) {
      return addResourceTag(vault, resource, tag);
    },
    getTag(resource, tagType) {
      return getResourceTag(vault, resource, tagType);
    },
    removeTag(resource, tagType, tagId) {
      return removeResourceTag(vault, resource, tagType, tagId);
    },
    hasTag(resource, tagType, tagId) {
      return hasResourceTag(vault, resource, tagType, tagId);
    },
    toggleTag(resource, tag) {
      return toggleResourceTag(vault, resource, tag);
    },
  };
}

export function useResourceTags(resource: ManifestEditorTagResource): ManifestEditorTag[] {
  const resourceId = getResourceId(resource);

  return useVaultSelector((state) => {
    if (!resourceId) {
      return EMPTY_TAGS;
    }
    return getResourceTagsFromState(state, resourceId);
  }, [resourceId]);
}

export function useResourceTagActions(resource: ManifestEditorTagResource) {
  const vault = useVault();
  const resourceId = getResourceId(resource);
  const tagActions = useMemo(() => createManifestEditorTagsApi(vault), [vault]);

  return useMemo(
    () => ({
      setTags(tags: ManifestEditorTag[]) {
        return tagActions.setTags(resourceId, tags);
      },
      addTag(tag: ManifestEditorTag) {
        return tagActions.addTag(resourceId, tag);
      },
      getTag(tagType: string) {
        return tagActions.getTag(resourceId, tagType);
      },
      removeTag(tagType: string, tagId?: string) {
        return tagActions.removeTag(resourceId, tagType, tagId);
      },
      toggleTag(tag: ManifestEditorTag) {
        return tagActions.toggleTag(resourceId, tag);
      },
      hasTag(tagType: string, tagId?: string) {
        return tagActions.hasTag(resourceId, tagType, tagId);
      },
    }),
    [tagActions, resourceId],
  );
}

export function ManifestEditorTagIcon({
  icon,
  title,
  ...props
}: SVGProps<SVGSVGElement> & { icon?: string; title?: string }) {
  if (icon !== "flag") {
    return null;
  }

  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden={title ? undefined : true} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M5 21a1 1 0 0 1-1-1V5.6c0-.42.26-.8.65-.94C6.7 3.9 8.65 4 10.5 4.7c1.55.58 3.05.7 4.5.36l3.75-.88A1 1 0 0 1 20 5.15v9.25c0 .46-.31.86-.75.97l-3.79.9c-1.85.43-3.76.28-5.66-.43-1.28-.48-2.55-.59-3.8-.33V20a1 1 0 0 1-1 1Z"
      />
    </svg>
  );
}

export function ManifestEditorTagBadge({
  tag,
  showIcon = true,
  className,
  style,
}: {
  tag: ManifestEditorTag;
  showIcon?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-0.5 rounded px-1 py-0.5 font-medium shadow-sm ${className || ""}`}
      style={{
        backgroundColor: tag.backgroundColor || "#e5e7eb",
        color: tag.textColor || "#111827",
        fontSize: 9,
        lineHeight: "11px",
        ...style,
      }}
    >
      {showIcon && tag.icon ? <ManifestEditorTagIcon icon={tag.icon} className="h-2.5 w-2.5 flex-shrink-0" /> : null}
      <span className="min-w-0 truncate">{getTagLabel(tag)}</span>
    </span>
  );
}

export function ManifestEditorTagOverlay({
  resource,
  tags,
  className,
}: {
  resource?: ManifestEditorTagResource;
  tags?: ManifestEditorTag[];
  className?: string;
}) {
  if (tags) {
    return <ManifestEditorTagOverlayContent tags={tags} className={className} />;
  }

  return <ManifestEditorResourceTagOverlay resource={resource} className={className} />;
}

function ManifestEditorResourceTagOverlay({
  resource,
  className,
}: {
  resource?: ManifestEditorTagResource;
  className?: string;
}) {
  const tags = useResourceTags(resource);

  return <ManifestEditorTagOverlayContent tags={tags} className={className} />;
}

function ManifestEditorTagOverlayContent({ tags, className }: { tags: ManifestEditorTag[]; className?: string }) {
  const resolvedTags = tags;

  if (!resolvedTags.length) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute bottom-1 right-1 z-10 flex max-w-full flex-wrap justify-end gap-0.5 ${className || ""}`}
    >
      {resolvedTags.map((tag) => (
        <ManifestEditorTagBadge key={tag.type} tag={tag} />
      ))}
    </div>
  );
}
