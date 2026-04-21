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

function normaliseTags(tags: ManifestEditorTag[] | undefined | null): ManifestEditorTag[] {
  if (!Array.isArray(tags)) {
    return [];
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

export function getResourceTags(vault: Vault, resource: ManifestEditorTagResource): ManifestEditorTag[] {
  const id = getResourceId(resource);
  if (!id) {
    return EMPTY_TAGS;
  }

  const meta = vault.getResourceMeta(id, TAGS_META_NAMESPACE) as { [TAGS_META_KEY]?: ManifestEditorTag[] } | undefined;
  return normaliseTags(meta?.[TAGS_META_KEY]);
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
): ManifestEditorTag[] {
  return setResourceTags(
    vault,
    resource,
    getResourceTags(vault, resource).filter((tag) => tag.type !== tagType),
  );
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

export function useResourceTags(resource: ManifestEditorTagResource): ManifestEditorTag[] {
  const resourceId = getResourceId(resource);

  return useVaultSelector((_, vault) => {
    if (!resourceId) {
      return EMPTY_TAGS;
    }
    return getResourceTags(vault, resourceId);
  }, [resourceId]);
}

export function useResourceTagActions(resource: ManifestEditorTagResource) {
  const vault = useVault();
  const resourceId = getResourceId(resource);

  return useMemo(
    () => ({
      setTags(tags: ManifestEditorTag[]) {
        return setResourceTags(vault, resourceId, tags);
      },
      addTag(tag: ManifestEditorTag) {
        return addResourceTag(vault, resourceId, tag);
      },
      getTag(tagType: string) {
        return getResourceTag(vault, resourceId, tagType);
      },
      removeTag(tagType: string) {
        return removeResourceTag(vault, resourceId, tagType);
      },
      toggleTag(tag: ManifestEditorTag) {
        return toggleResourceTag(vault, resourceId, tag);
      },
      hasTag(tagType: string, tagId?: string) {
        return hasResourceTag(vault, resourceId, tagType, tagId);
      },
    }),
    [vault, resourceId],
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
        backgroundColor: tag.backgroundColor,
        color: tag.textColor,
        fontSize: 9,
        lineHeight: "11px",
        ...style,
      }}
    >
      {showIcon && tag.icon ? <ManifestEditorTagIcon icon={tag.icon} className="h-2.5 w-2.5 flex-shrink-0" /> : null}
      <span className="min-w-0 truncate">{tag.label}</span>
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
