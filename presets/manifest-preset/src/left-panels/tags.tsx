import type { Vault } from "@iiif/helpers/vault";
import { ActionButton, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import {
  createManifestEditorTagsApi,
  getResourceTagGroups,
  type LayoutPanel,
  type ManifestEditorTag,
  ManifestEditorTagBadge,
  type ManifestEditorTagGroup,
  type ManifestEditorTagGroupRow,
  useManifestEditor,
} from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";

type CanvasTagResource = { id: string; type: "Canvas" };
type ManifestRootResource = { id: string; type?: string } | null | undefined;

export const tagsPanel: LayoutPanel = {
  id: "@manifest-editor/tags",
  label: "Tags",
  icon: <TagsIcon />,
  supports: ({ vault, rootResource }) => manifestHasCanvasTags(vault, rootResource),
  render: () => <TagsSidebar />,
};

export function manifestHasCanvasTags(vault: Vault | undefined, rootResource: ManifestRootResource): boolean {
  if (!vault || rootResource?.type !== "Manifest" || !rootResource.id) {
    return false;
  }

  const manifest = vault.get(rootResource as any, { skipSelfReturn: false } as any) as
    | { items?: Array<{ id?: string; type?: string }> }
    | undefined;
  const canvasResources = (manifest?.items || [])
    .map((canvas) => canvas?.id)
    .filter((id): id is string => !!id)
    .map((id) => ({ id, type: "Canvas" }) satisfies CanvasTagResource);

  return getResourceTagGroups(vault, canvasResources).length > 0;
}

function TagsSidebar() {
  const vault = useVault();
  const { structural } = useManifestEditor();
  const canvases = structural.items.get() || [];
  const canvasResources = useMemo(
    () =>
      canvases
        .map((canvas) => canvas?.id)
        .filter((id): id is string => !!id)
        .map((id) => ({ id, type: "Canvas" }) satisfies CanvasTagResource),
    [canvases],
  );
  const canvasIdsKey = useMemo(() => canvasResources.map((canvas) => canvas.id).join("|"), [canvasResources]);
  const groups = useVaultSelector(() => getResourceTagGroups(vault, canvasResources), [canvasIdsKey]);
  const rows = useMemo(() => groups.flatMap((group) => group.rows), [groups]);
  const availableRowKeys = useMemo(() => rows.map((row) => row.key).join("|"), [rows]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(() => new Set());
  const tagActions = useMemo(() => createManifestEditorTagsApi(vault), [vault]);
  const selectedTagRows = useMemo(() => rows.filter((row) => selectedRows.has(row.key)), [rows, selectedRows]);
  const totalTagApplications = useMemo(() => groups.reduce((total, group) => total + group.tagCount, 0), [groups]);
  const taggedCanvasCount = useMemo(
    () => new Set(groups.flatMap((group) => group.canvasIds)).size,
    [groups],
  );

  useEffect(() => {
    const available = new Set(rows.map((row) => row.key));
    setSelectedRows((current) => {
      const next = new Set(Array.from(current).filter((key) => available.has(key)));
      return next.size === current.size ? current : next;
    });
  }, [availableRowKeys, rows]);

  function removeRows(rowsToDelete: ManifestEditorTagGroupRow[], confirmationLabel: string) {
    if (!rowsToDelete.length) {
      return;
    }

    const tagApplications = rowsToDelete.reduce((total, row) => total + row.canvasCount, 0);
    const affectedCanvasCount = new Set(rowsToDelete.flatMap((row) => row.canvasIds)).size;
    const confirmed = window.confirm(
      `Delete ${formatCount(tagApplications, "tag application")} from ${formatCount(affectedCanvasCount, "canvas")}?\n\n${confirmationLabel}`,
    );

    if (!confirmed) {
      return;
    }

    for (const row of rowsToDelete) {
      for (const canvasId of row.canvasIds) {
        tagActions.removeTag({ id: canvasId, type: "Canvas" }, row.type, row.id);
      }
    }

    setSelectedRows((current) => {
      const next = new Set(current);
      for (const row of rowsToDelete) {
        next.delete(row.key);
      }
      return next;
    });
  }

  function removeGroup(group: ManifestEditorTagGroup) {
    removeRows(group.rows, `Type: ${group.type}`);
  }

  function removeSelectedRows() {
    removeRows(selectedTagRows, `${formatCount(selectedTagRows.length, "tag")} selected.`);
  }

  function removeAllTags() {
    if (!totalTagApplications) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${formatCount(totalTagApplications, "tag application")} from ${formatCount(taggedCanvasCount, "canvas")}?`,
    );

    if (!confirmed) {
      return;
    }

    for (const canvas of canvasResources) {
      tagActions.setTags(canvas, []);
    }
    setSelectedRows(new Set());
  }

  return (
    <Sidebar>
      <SidebarHeader
        title="Tags"
        actions={[
          {
            icon: <DeleteTagIcon className="text-xl" />,
            title: "Delete all tags",
            disabled: totalTagApplications === 0,
            onClick: removeAllTags,
          },
        ]}
      />
      <SidebarContent className="p-3">
        <TagsSummary
          totalTagApplications={totalTagApplications}
          taggedCanvasCount={taggedCanvasCount}
          totalCanvasCount={canvasResources.length}
        />
        {!canvasResources.length ? (
          <TagsEmptyState title="No canvases" message="Canvas tags will appear here after canvases are added." />
        ) : !groups.length ? (
          <TagsEmptyState title="No canvas tags" message="Canvas tags added by editor tools and background actions will appear here." />
        ) : (
          <div className="grid gap-3 pb-4">
            {groups.map((group) => (
              <TagGroupSection
                key={group.key}
                group={group}
                selectedRows={selectedRows}
                onToggleRow={(key, selected) => {
                  setSelectedRows((current) => {
                    const next = new Set(current);
                    if (selected) {
                      next.add(key);
                    } else {
                      next.delete(key);
                    }
                    return next;
                  });
                }}
                onRemoveGroup={() => removeGroup(group)}
              />
            ))}
          </div>
        )}
      </SidebarContent>
      <div className="border-t border-me-gray-200 bg-white p-3">
        <ActionButton
          primary
          center
          className="w-full justify-center"
          isDisabled={!selectedTagRows.length}
          onPress={removeSelectedRows}
        >
          <DeleteTagIcon className="text-xl" />
          Delete selected ({selectedTagRows.length})
        </ActionButton>
      </div>
    </Sidebar>
  );
}

function TagsSummary({
  totalTagApplications,
  taggedCanvasCount,
  totalCanvasCount,
}: {
  totalTagApplications: number;
  taggedCanvasCount: number;
  totalCanvasCount: number;
}) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
      <div className="rounded border border-me-gray-200 bg-me-gray-50 p-2">
        <div className="font-medium text-me-gray-600">Tag applications</div>
        <div className="text-lg font-semibold text-me-gray-900">{totalTagApplications}</div>
      </div>
      <div className="rounded border border-me-gray-200 bg-me-gray-50 p-2">
        <div className="font-medium text-me-gray-600">Tagged canvases</div>
        <div className="text-lg font-semibold text-me-gray-900">
          {taggedCanvasCount}/{totalCanvasCount}
        </div>
      </div>
    </div>
  );
}

function TagsEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <TagsIcon className="h-16 w-16 text-me-gray-300" />
      <div>
        <h2 className="text-sm font-semibold text-me-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-me-gray-500">{message}</p>
      </div>
    </div>
  );
}

function TagGroupSection({
  group,
  selectedRows,
  onToggleRow,
  onRemoveGroup,
}: {
  group: ManifestEditorTagGroup;
  selectedRows: Set<string>;
  onToggleRow: (key: string, selected: boolean) => void;
  onRemoveGroup: () => void;
}) {
  return (
    <section className="overflow-hidden rounded border border-me-gray-200 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-me-gray-200 bg-me-gray-50 px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-me-gray-900">{group.type}</h2>
          <p className="text-xs text-me-gray-600">
            {formatCount(group.tagCount, "tag application")} on {formatCount(group.canvasCount, "canvas")}
          </p>
        </div>
        <button
          type="button"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-me-gray-500 hover:bg-red-100 hover:text-red-700"
          aria-label={`Delete ${group.type} tags`}
          title={`Delete ${group.type} tags`}
          onClick={onRemoveGroup}
        >
          <DeleteTagIcon className="text-lg" />
        </button>
      </div>
      <div className="divide-y divide-me-gray-100">
        {group.rows.map((row) => (
          <TagRow
            key={row.key}
            row={row}
            selected={selectedRows.has(row.key)}
            onToggle={(selected) => onToggleRow(row.key, selected)}
          />
        ))}
      </div>
    </section>
  );
}

function TagRow({
  row,
  selected,
  onToggle,
}: {
  row: ManifestEditorTagGroupRow;
  selected: boolean;
  onToggle: (selected: boolean) => void;
}) {
  const tag = getDisplayTag(row);

  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-2 px-3 py-2 hover:bg-me-gray-50">
      <input
        type="checkbox"
        className="h-4 w-4 flex-shrink-0"
        checked={selected}
        onChange={(event) => onToggle(event.currentTarget.checked)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <ManifestEditorTagBadge tag={tag} style={{ fontSize: 11, lineHeight: "14px" }} />
          <span className="min-w-0 truncate text-sm font-medium text-me-gray-900">{tag.label}</span>
        </div>
        <div className="mt-1 truncate text-xs text-me-gray-500">{row.id}</div>
      </div>
      <div className="flex-shrink-0 rounded bg-me-gray-100 px-2 py-1 text-xs font-medium text-me-gray-700">
        {row.canvasCount}
      </div>
    </label>
  );
}

function getDisplayTag(row: ManifestEditorTagGroupRow): ManifestEditorTag {
  const tag = row.tag as Partial<ManifestEditorTag>;
  return {
    type: row.type,
    id: row.id,
    label: tag.label || row.id || row.type,
    backgroundColor: tag.backgroundColor || "#e5e7eb",
    textColor: tag.textColor || "#111827",
    icon: tag.icon,
  };
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export function TagsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M20.59 13.41 12.58 5.4A2 2 0 0 0 11.17 4H5a1 1 0 0 0-1 1v6.17a2 2 0 0 0 .59 1.41l8.01 8.01a2 2 0 0 0 2.82 0l5.17-5.17a2 2 0 0 0 0-2.82ZM7.5 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      />
    </svg>
  );
}

function DeleteTagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="none" d="M0 0h24v24H0z" />
      <path
        fill="currentColor"
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12Zm2-10h8v10H8V9Zm7.5-5-1-1h-5l-1 1H5v2h14V4h-3.5Z"
      />
    </svg>
  );
}
