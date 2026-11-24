import type { InternationalString, MetadataItem } from "@iiif/presentation-3";
import { ActionButton, AddIcon } from "@manifest-editor/components";
import { Metadata } from "./Metadata";
import {
  ResourceEditingProvider,
  useConfig,
  useEditor,
  useSpecifications,
} from "@manifest-editor/shell";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  canConvertToRequiredStatement,
  describeUniqueSourceMetadata,
  extractSourceMetadataGroups,
  type FetchSourceManifest,
  getMissingMetadataTemplates,
  getSourceManifestRefs,
  languageMapTexts,
  loadSourceManifest,
  metadataItemSignature,
  metadataItemToRequiredStatement,
  type RequiredStatementConversionConfig,
  type SourceManifestRef,
  type SourceMetadataGroup,
  specificationMetadataTemplates,
} from "./metadata-tools";

/** Shared metadata editing and source recovery. Provide a resource when outside the editing stack. */
export function ResourceMetadataTab({
  resource,
  embedded,
}: {
  resource?: { id: string; type: string } | null;
  /** Drops the container padding when nested inside an already padded panel. */
  embedded?: boolean;
}) {
  if (!resource) return <ResourceMetadataContent embedded={embedded} />;
  return (
    <ResourceEditingProvider resource={resource}>
      <ResourceMetadataContent embedded={embedded} />
    </ResourceEditingProvider>
  );
}

export function useResourceMetadataConfig(resourceType: string) {
  const { editorConfig, i18n } = useConfig();
  const specifications = useSpecifications();

  return useMemo(() => {
    const all = (editorConfig as any)?.All || {};
    const specific = (editorConfig as any)?.[resourceType] || {};
    // Later (more specific) configuration wins, explicit `false`/`[]` is preserved.
    const requiredStatement: RequiredStatementConversionConfig = {
      ...(all.metadataRequiredStatement || {}),
      ...(specific.metadataRequiredStatement || {}),
    };
    const language = i18n?.defaultLanguage || "none";
    const templates: MetadataItem[] = [
      ...(all.metadataTemplates || []),
      ...(specific.metadataTemplates || []),
      ...specificationMetadataTemplates(specifications as any, resourceType, language),
    ];
    return { requiredStatement, templates };
  }, [editorConfig, i18n?.defaultLanguage, resourceType, specifications]);
}

export function ResourceMetadataContent({ embedded }: { embedded?: boolean } = {}) {
  const editor = useEditor();
  const ref = editor.ref();
  const { descriptive, linking } = editor;
  const config = useResourceMetadataConfig(ref.type);
  const current = (descriptive.metadata.get() || []) as MetadataItem[];
  const partOf = linking.partOf.get();

  const sourceRefs = useMemo(() => getSourceManifestRefs(partOf), [partOf]);

  const addItem = useCallback(
    (item: Pick<MetadataItem, "label" | "value">) => {
      descriptive.metadata.add(item.label, item.value);
    },
    [descriptive.metadata]
  );

  const convertToRequiredStatement = useCallback(
    (item: MetadataItem, remove: () => void) => {
      const statement = metadataItemToRequiredStatement(item);
      descriptive.requiredStatement.set(statement as any);
      remove();
    },
    [descriptive.requiredStatement]
  );

  const hasRequiredStatement = languageMapTexts(descriptive.requiredStatement.get()?.value).some(
    (text) => text.trim().length > 0
  );

  return (
    <Metadata
      embedded={embedded}
      renderItemActions={({ item, remove }) =>
        canConvertToRequiredStatement(item, config.requiredStatement) ? (
          <button
            type="button"
            className="rounded border border-me-primary-500 bg-white px-2 py-0.5 text-xs text-me-primary-500 hover:bg-me-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
            title={
              hasRequiredStatement
                ? "Moves this item into the required statement, replacing the current one"
                : "Moves this item into the required statement"
            }
            onClick={() => convertToRequiredStatement(item, remove)}
          >
            {hasRequiredStatement ? "Replace required statement with this" : "Use as required statement"}
          </button>
        ) : null
      }
    >
      <MetadataTemplates templates={config.templates} current={current} onAdd={addItem} />
      <SourceMetadataRecovery
        key={`${ref.type}:${ref.id}`}
        refs={sourceRefs}
        resource={ref}
        current={current}
        onAdd={addItem}
      />
    </Metadata>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mb-1 mt-4 text-sm font-semibold text-gray-700">
      {children}
    </h3>
  );
}

function firstText(value: InternationalString | null | undefined) {
  return languageMapTexts(value).find((text) => text.trim()) || "";
}

function plain(value: InternationalString | null | undefined) {
  return firstText(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function MetadataTemplates({
  templates,
  current,
  onAdd,
}: {
  templates: MetadataItem[];
  current: MetadataItem[];
  onAdd: (item: MetadataItem) => void;
}) {
  const missing = useMemo(() => getMissingMetadataTemplates(templates, current), [templates, current]);
  if (!missing.length) return null;

  return (
    <section aria-labelledby="exhibition-metadata-templates" className="mt-2">
      <SectionHeading id="exhibition-metadata-templates">Suggested fields</SectionHeading>
      <ul className="m-0 list-none p-0">
        {missing.map((item, index) => (
          <li
            key={`${plain(item.label)}-${index}`}
            className="mb-1 flex items-center justify-between gap-2 rounded border border-dashed border-gray-300 bg-white p-2"
          >
            <span className="min-w-0 text-sm">
              <span className="block break-words font-semibold text-[#333]">{plain(item.label)}</span>
              {plain(item.value) ? (
                <span className="block break-words text-xs text-gray-600">{plain(item.value)}</span>
              ) : null}
            </span>
            <ActionButton aria-label={`Add ${plain(item.label)} field`} onPress={() => onAdd(item)}>
              <AddIcon />
              Add
            </ActionButton>
          </li>
        ))}
      </ul>
      {missing.length > 1 ? (
        <ActionButton className="mt-1" onPress={() => missing.forEach(onAdd)}>
          <AddIcon />
          Add all suggested fields
        </ActionButton>
      ) : null}
    </section>
  );
}

type SourceState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; groups: SourceMetadataGroup[] };

/**
 * Loads the *original* manifest (not the truncated `partOf` reference stored on the resource)
 * so that metadata removed from this resource can be put back.
 */
export function useSourceMetadata(
  refs: SourceManifestRef[],
  resource: { id: string; type: string },
  fetchManifest?: FetchSourceManifest
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SourceState>({ status: "loading" });
  const refKey = refs.map((ref) => ref.id).join("\n");

  useEffect(() => {
    if (!refs.length) return;
    const controller = new AbortController();
    setState({ status: "loading" });

    Promise.allSettled(refs.map((ref) => loadSourceManifest(ref.id, { signal: controller.signal, fetchManifest })))
      .then((results) => {
        if (controller.signal.aborted) return;
        const groups: SourceMetadataGroup[] = [];
        let failure: string | null = null;
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            groups.push(...extractSourceMetadataGroups(result.value, resource));
          } else {
            failure = result.reason?.message || "Unable to load the original manifest";
          }
        });
        setState(groups.length || !failure ? { status: "ready", groups } : { status: "error", message: failure });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ status: "error", message: error?.message || String(error) });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refKey, resource.id, resource.type, attempt, fetchManifest]);

  return {
    state,
    retry: () => setAttempt((count) => count + 1),
  };
}

function SourceMetadataRecovery({
  refs,
  resource,
  current,
  onAdd,
}: {
  refs: SourceManifestRef[];
  resource: { id: string; type: string };
  current: MetadataItem[];
  onAdd: (item: MetadataItem) => void;
}) {
  const { state, retry } = useSourceMetadata(refs, resource);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const panelId = useId();

  const groups = state.status === "ready" ? state.groups : null;
  // One list across every source group; duplicates are shown and counted once.
  const rows = useMemo(() => (groups ? describeUniqueSourceMetadata(groups, current) : []), [groups, current]);
  if (!refs.length) return null;

  const missing = rows.filter((row) => !row.present);
  const added = rows.length - missing.length;
  const visible = showAll ? rows : missing;
  const ready = state.status === "ready";

  return (
    <section aria-labelledby="exhibition-metadata-source" className="pt-8">
      <h3 id="exhibition-metadata-source" className="m-0 text-sm font-semibold text-gray-700">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            ready
              ? `Original source metadata, ${missing.length} missing ${missing.length === 1 ? "field" : "fields"}`
              : undefined
          }
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-2 rounded bg-transparent px-0 py-1 text-left text-sm font-semibold text-gray-700 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
        >
          <span aria-hidden className="inline-block w-3 text-xs">
            {open ? "▾" : "▸"}
          </span>
          <span>Original source metadata</span>
          {ready && missing.length > 0 ? (
            <span
              aria-hidden
              className="inline-flex min-w-5 items-center justify-center rounded-full bg-me-primary-500 px-1.5 text-xs font-semibold leading-5 text-white"
            >
              {missing.length}
            </span>
          ) : null}
          {ready && rows.length > 0 && missing.length === 0 ? (
            <span aria-hidden className="text-xs font-normal text-gray-500">
              All added
            </span>
          ) : null}
        </button>
      </h3>
      <div aria-live="polite">
        {state.status === "loading" && open ? (
          <p className="m-0 mt-1 text-xs text-gray-600">Loading original manifest…</p>
        ) : null}
        {state.status === "error" ? (
          <div role="alert" className="mt-1 text-xs text-red-700">
            <p className="m-0 mb-1">{state.message}</p>
            <ActionButton onPress={retry}>Try again</ActionButton>
          </div>
        ) : null}
      </div>
      <div id={panelId} hidden={!open} className="mt-2">
        {open && ready ? (
          <>
            {!rows.length ? (
              <p className="m-0 text-xs text-gray-600">The original manifest has no metadata for this item.</p>
            ) : (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  {added > 0 ? (
                    <button
                      type="button"
                      aria-pressed={showAll}
                      onClick={() => setShowAll((value) => !value)}
                      className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
                    >
                      {showAll ? "Hide already added" : "Show all fields"}
                    </button>
                  ) : (
                    <span />
                  )}
                  {missing.length > 1 ? (
                    <ActionButton onPress={() => missing.forEach((row) => onAdd(row.item))}>
                      <AddIcon />
                      Add all missing ({missing.length})
                    </ActionButton>
                  ) : null}
                </div>
                {!visible.length ? (
                  <p className="m-0 text-xs text-gray-600">All original fields have been added.</p>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {visible.map((row) => (
                      <li
                        key={metadataItemSignature(row.item)}
                        className="mb-1 flex items-center justify-between gap-2 rounded border border-gray-200 bg-white p-2"
                      >
                        <span className="min-w-0 text-sm">
                          <span className="block break-words font-semibold text-[#333]">
                            {plain(row.item.label) || "Untitled"}
                          </span>
                          <span className="block break-words text-xs text-gray-600">{plain(row.item.value)}</span>
                        </span>
                        {row.present ? (
                          <span className="shrink-0 text-xs text-gray-500">Already added</span>
                        ) : (
                          <ActionButton
                            aria-label={`Add ${plain(row.item.label) || "metadata"} back`}
                            onPress={() => onAdd(row.item)}
                          >
                            <AddIcon />
                            Add
                          </ActionButton>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
