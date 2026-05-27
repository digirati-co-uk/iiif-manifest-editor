import { ActionButton } from "@manifest-editor/components";
import { TiptapRichTextLanguageField } from "@manifest-editor/editors";
import {
  type CanvasEditorDefinition,
  useConfig,
  useGenericEditor,
  useInlineCreator,
  useLocalStorage,
} from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-aria-components";
import {
  AnnotationContext,
  LocaleString,
  type TextualContentStrategy,
  useAnnotation,
  useCanvas,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import { getGridStats, getHeightWidthRatio } from "../helpers";
import {
  exhibitionPreviewPresetOptions,
  useExhibitionPreviewPreset,
} from "../helpers/exhibition-preview-state";
import type { PresetUrlSearchParamsPreset } from "../helpers/exhibition-preview-url-helper";

export const infoBlockEditor: CanvasEditorDefinition = {
  id: "info-block-editor",
  label: "info Block Editor",
  component: (strategy) => (
    <InfoBlockEditor strategy={strategy as TextualContentStrategy} />
  ),
  supports: {
    strategy: (strategy, _resource, _vault) => {
      if (strategy.type !== "textual-content") {
        return false;
      }
      return true;
    },
  },
};

type InfoBlockMode = "edit" | "preview";

export function getLanguageCodeDetails(languageCode: string) {
  if (languageCode === "@none" || languageCode === "none") {
    return null;
  }
  try {
    const helper = new Intl.DisplayNames([languageCode], { type: "language" });
    if (languageCode === "cy") {
      return { key: languageCode, language: languageCode, label: "Cymraeg" };
    }
    return {
      key: languageCode,
      language: languageCode,
      label: helper.of(languageCode) as string,
    };
  } catch (e) {
    return { key: languageCode, language: languageCode, label: languageCode };
  }
}

// ─── Language selector ─────────────────────────────────────────────────────────

function LanguageSelector({
  selectedLanguage,
  languages,
  availableLanguages,
  onSelectLanguage,
  onAddLanguage,
}: {
  selectedLanguage: string;
  languages: string[];
  availableLanguages: string[];
  onSelectLanguage: (lang: string) => void;
  onAddLanguage: (lang: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const addableLanguages = availableLanguages.filter(
    (l) => !languages.includes(l),
  );
  const details = getLanguageCodeDetails(selectedLanguage);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="">{details?.label || selectedLanguage}</span>
        <svg
          className="h-3 w-3 text-slate-400"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[14rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {languages.length > 0 && (
            <>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Language
              </div>
              {languages.map((lang) => {
                const details = getLanguageCodeDetails(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    className={twMerge(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50",
                      lang === selectedLanguage
                        ? "font-semibold text-slate-900"
                        : "text-slate-600",
                    )}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setOpen(false);
                    }}
                  >
                    {lang === selectedLanguage ? (
                      <svg
                        className="h-3 w-3 shrink-0 text-slate-500"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth={2}
                          fill="none"
                        />
                      </svg>
                    ) : (
                      <div className="h-3 w-3 shrink-0 text-slate-500" />
                    )}
                    <span className={lang === selectedLanguage ? "" : "ml-5"}>
                      {details?.label || lang}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {addableLanguages.length > 0 && (
            <>
              {languages.length > 0 && (
                <div className="my-1 border-t border-slate-100" />
              )}
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Add language
              </div>
              {addableLanguages.map((lang) => {
                const details = getLanguageCodeDetails(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      onAddLanguage(lang);
                      setOpen(false);
                    }}
                  >
                    <svg
                      className="h-3 w-3 shrink-0 text-slate-400"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 2v8M2 6h8" />
                    </svg>
                    {details?.label || lang}
                  </button>
                );
              })}
            </>
          )}

          {addableLanguages.length === 0 && languages.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-400">
              No languages available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers to collect all languages present in the canvas annotations ───────

function collectLanguagesFromPage(page: any, vault: any): string[] {
  if (!page) return [];
  const items: any[] = page.items || [];
  const langs = new Set<string>();
  for (const annotationRef of items) {
    const annotation = resolveResource(annotationRef, vault);
    if (!annotation) continue;
    const bodies = toArray(annotation.body);
    for (const bodyRef of bodies) {
      const body = resolveResource(bodyRef, vault);
      if (body?.language) langs.add(body.language);
    }
  }
  return Array.from(langs);
}

// ─── Main editor ──────────────────────────────────────────────────────────────

function InfoBlockEditor({ strategy }: { strategy: TextualContentStrategy }) {
  const canvas = useCanvas();
  const vault = useVault();
  const behavior = canvas?.behavior || [];
  const dims = getHeightWidthRatio(behavior);
  const hasDimension = Boolean(dims.h && dims.w);
  const { isBottom, isLeft, isRight } = getGridStats(behavior);
  const compact = hasDimension && dims.w <= 6;
  const annotationPage = useVaultSelector((_, vault) =>
    canvas?.items[0] ? vault.get(canvas.items[0]) : null,
  );
  const longSummaries = useVaultSelector((_, vault) =>
    canvas?.annotations[0] ? vault.get(canvas?.annotations[0]!) : null,
  );

  const {
    i18n: { availableLanguages, defaultLanguage },
  } = useConfig();

  const [mode, setMode] = useLocalStorage<InfoBlockMode>(
    "exhibition-info-block-mode",
    "edit",
  );
  const [previewPreset, setPreviewPreset] = useExhibitionPreviewPreset();

  // Collect all languages present in the canvas
  const presentLanguages = useMemo(() => {
    const fromItems = collectLanguagesFromPage(annotationPage, vault);
    const fromAnnotations = collectLanguagesFromPage(longSummaries, vault);
    const all = new Set([...fromItems, ...fromAnnotations]);
    if (all.size === 0) all.add(defaultLanguage || "en");
    return Array.from(all);
  }, [annotationPage, longSummaries, vault, defaultLanguage]);

  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>(
    "exhibition-info-block-language",
    defaultLanguage || "en",
  );

  // Make sure selected language is always in the present list
  const effectiveLanguage = presentLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : presentLanguages[0] || defaultLanguage || "en";

  // When a new language is added we switch to it immediately
  const handleAddLanguage = (lang: string) => {
    setSelectedLanguage(lang);
  };

  // For narrow columns (w <= 6), cap the editor width so it doesn't sprawl
  const editorMaxWidth = compact ? "28rem" : undefined;

  return (
    <div className="relative z-0 flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-white">
      {/* Toolbar — same height and position as the image viewer toolbar */}
      <div className="exhibition-slideshow-current-toolbar flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <LocaleString className="block truncate text-sm font-semibold text-slate-800">
            {canvas?.label}
          </LocaleString>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <LanguageSelector
              selectedLanguage={effectiveLanguage}
              languages={presentLanguages}
              availableLanguages={availableLanguages}
              onSelectLanguage={setSelectedLanguage}
              onAddLanguage={handleAddLanguage}
            />
          )}
          {mode === "preview" ? (
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm"
              value={previewPreset}
              onChange={(e) =>
                setPreviewPreset(e.target.value as PresetUrlSearchParamsPreset)
              }
            >
              {exhibitionPreviewPresetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
          <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold">
            <ModeButton
              selected={mode === "edit"}
              onPress={() => setMode("edit")}
            >
              Edit
            </ModeButton>
            <ModeButton
              selected={mode === "preview"}
              onPress={() => setMode("preview")}
            >
              Preview
            </ModeButton>
          </div>
        </div>
      </div>

      {/* Content area */}
      {mode === "preview" ? (
        <div className="min-h-0 flex-1">
          <ExhibitionPreviewPanel preset={previewPreset} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <SummarySection
            annotationPage={annotationPage}
            compact={compact}
            editorMaxWidth={editorMaxWidth}
            fallbackText={strategy.items[0]?.text}
            heading="Short summary"
            panelClassName={twMerge(
              "border-b border-gray-100",
              compact ? "p-3" : "p-5",
              hasDimension && (isLeft || isRight) ? "max-w-xl" : "",
              hasDimension && isBottom ? "max-w-4xl" : "",
            )}
            parentProperty="items"
            selectedLanguage={effectiveLanguage}
            onLanguageAdded={handleAddLanguage}
          />
          <SummarySection
            annotationPage={longSummaries}
            compact={compact}
            heading="Long summary"
            panelClassName={twMerge(compact ? "p-3" : "p-5")}
            parentProperty="annotations"
            selectedLanguage={effectiveLanguage}
            onLanguageAdded={handleAddLanguage}
          />
        </div>
      )}
    </div>
  );
}

// ─── Small UI components ──────────────────────────────────────────────────────

function ModeButton({
  children,
  selected,
  onPress,
}: {
  children: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className={twMerge(
        "px-3 py-2 text-xs font-semibold transition",
        selected
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700",
      )}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

// ─── Editor sections ──────────────────────────────────────────────────────────

function SummarySection({
  annotationPage,
  compact,
  editorMaxWidth,
  fallbackText,
  heading,
  panelClassName,
  parentProperty,
  selectedLanguage,
  onLanguageAdded,
}: {
  annotationPage: any;
  compact?: boolean;
  editorMaxWidth?: string;
  fallbackText?: any;
  heading: string;
  panelClassName?: string;
  parentProperty: "items" | "annotations";
  selectedLanguage: string;
  onLanguageAdded: (lang: string) => void;
}) {
  const canvas = useCanvas();
  const creator = useInlineCreator();
  const vault = useVault();
  const {
    i18n: { defaultLanguage },
  } = useConfig();
  const page = annotationPage || null;
  const items = page?.items || [];
  const visibleItems = getVisibleItems(items, vault);

  const createSummaryPage = () => {
    if (!canvas) return;
    creator.create(
      "@manifest-editor/empty-annotation-page",
      { label: { en: [heading] } },
      {
        target: { id: canvas.id, type: "Canvas" },
        targetType: "AnnotationPage",
        parent: {
          property: parentProperty,
          resource: { id: canvas.id, type: "Canvas" },
        },
      },
    );
  };

  const createSummaryAnnotation = () => {
    if (!canvas) return;

    if (!page) {
      createSummaryPage();
      return;
    }

    creator.create(
      "@manifest-editor/html-annotation",
      {
        label: { en: [heading] },
        body: { [selectedLanguage || defaultLanguage || "en"]: [""] },
        motivation: parentProperty === "annotations" ? "tagging" : "painting",
      },
      {
        target: { id: canvas.id, type: "Canvas" },
        targetType: "Annotation",
        parent: {
          property: "items",
          resource: { id: page.id, type: "AnnotationPage" },
        },
        initialData: {},
      },
    );
  };

  // Add a body in the selected language to every annotation in this page
  const addLanguageToPage = () => {
    if (!page) {
      // If there's no page yet, create an annotation with the selected language
      createSummaryAnnotation();
      onLanguageAdded(selectedLanguage);
      return;
    }

    let addedAny = false;
    for (const annotationRef of items) {
      const annotation = resolveResource(annotationRef, vault);
      if (!annotation) continue;
      const bodies = toArray(annotation.body);
      const alreadyHasLang = bodies.some((bodyRef) => {
        const body = resolveResource(bodyRef, vault);
        return body?.language === selectedLanguage;
      });
      if (alreadyHasLang) continue;

      // Create a new body with the selected language by cloning the first body's structure
      const firstBodyRef = bodies[0];
      const firstBody = firstBodyRef
        ? resolveResource(firstBodyRef, vault)
        : null;
      const newBodyId = `${annotation.id}-body-${selectedLanguage}-${Date.now()}`;
      vault.batch(() => {
        vault.dispatch({
          type: "entities/update",
          payload: {
            type: "ContentResource",
            id: newBodyId,
            language: selectedLanguage,
            value: "",
            format: firstBody?.format || "text/html",
            motivation: firstBody?.motivation,
          },
        });
        vault.modifyEntityField(
          { id: annotation.id, type: "Annotation" },
          "body",
          [...bodies, { id: newBodyId, type: "ContentResource" }],
        );
      });
      addedAny = true;
    }

    if (addedAny) {
      onLanguageAdded(selectedLanguage);
    } else {
      // If there were no annotations yet, create a fresh one
      createSummaryAnnotation();
      onLanguageAdded(selectedLanguage);
    }
  };

  // Check whether the selected language is already represented in this page
  const languageExistsInPage = useMemo(() => {
    if (!page) return false;
    for (const annotationRef of items) {
      const annotation = resolveResource(annotationRef, vault);
      if (!annotation) continue;
      const bodies = toArray(annotation.body);
      for (const bodyRef of bodies) {
        const body = resolveResource(bodyRef, vault);
        if (body?.language === selectedLanguage) return true;
      }
    }
    return false;
  }, [page, items, vault, selectedLanguage]);

  return (
    <section className={twMerge("min-w-0 max-w-full", panelClassName)}>
      <div
        className={twMerge(
          "flex items-center justify-between gap-3",
          visibleItems.length ? "mb-3" : "mb-0",
        )}
      >
        <h2
          className={twMerge(
            "font-semibold tracking-tight text-gray-700",
            compact ? "text-xs uppercase" : "text-sm uppercase tracking-wide",
          )}
        >
          {heading}
        </h2>
        {!languageExistsInPage && (
          <ActionButton primary onPress={addLanguageToPage}>
            {page ? "Add text" : "Add"}
          </ActionButton>
        )}
      </div>

      {!page && fallbackText ? (
        <div className="mt-2 text-sm text-gray-600">
          <LocaleString enableDangerouslySetInnerHTML>
            {fallbackText}
          </LocaleString>
        </div>
      ) : null}

      {visibleItems.length ? (
        <div className="min-w-0 max-w-full">
          {visibleItems.map(({ item: annotation, index }) => (
            <AnnotationContext
              key={annotation.id + index}
              annotation={annotation.id}
            >
              <AnnotationEditor
                compact={compact}
                editorMaxWidth={editorMaxWidth}
                pageItems={items}
                pageRef={{ id: page.id, type: "AnnotationPage" }}
                selectedLanguage={selectedLanguage}
                onRemoveAnnotation={() => {
                  vault.modifyEntityField(
                    { id: page.id, type: "AnnotationPage" },
                    "items",
                    items.filter(
                      (_item: any, itemIndex: number) => itemIndex !== index,
                    ),
                  );
                }}
              />
            </AnnotationContext>
          ))}
        </div>
      ) : page && languageExistsInPage ? (
        <div
          className={twMerge(
            "mt-2 text-sm text-gray-400 italic",
            compact ? "" : "",
          )}
        >
          No text added yet.
        </div>
      ) : null}
    </section>
  );
}

function AnnotationEditor({
  compact,
  editorMaxWidth,
  onRemoveAnnotation: _onRemoveAnnotation,
  pageItems,
  pageRef,
  selectedLanguage,
}: {
  compact?: boolean;
  editorMaxWidth?: string;
  onRemoveAnnotation: () => void;
  pageItems: any[];
  pageRef: { id: string; type: "AnnotationPage" };
  selectedLanguage: string;
}) {
  const annotation = useAnnotation();
  const vault = useVault();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);

  if (!annotation) {
    return null;
  }

  // Show only the body matching the selected language
  const allBodiesWithIndex = bodies.map((item: any, index: number) => ({
    item,
    index,
  }));
  const languageBodies = allBodiesWithIndex.filter(
    ({ item }: { item: any }) => {
      const body = resolveResource(item, vault);
      return body?.language === selectedLanguage;
    },
  );
  const visibleBodies = languageBodies.length > 0 ? languageBodies : [];

  const pruneEmptySiblings = useCallback(
    (currentBodyId: string) => {
      const nextBodies = filterEmptyRefs(bodies, vault, currentBodyId);
      if (nextBodies.length !== bodies.length) {
        vault.modifyEntityField(
          { id: annotation.id, type: "Annotation" },
          "body",
          nextBodies,
        );
      }

      const nextPageItems = filterEmptyAnnotations(
        pageItems,
        vault,
        annotation.id,
      );
      if (nextPageItems.length !== pageItems.length) {
        vault.modifyEntityField(pageRef, "items", nextPageItems);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [annotation.id, pageRef.id, pageItems, vault],
  );

  if (!visibleBodies.length) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      {visibleBodies.map(
        ({ item: body, index }: { item: any; index: number }) => (
          <TiptapAnnotationBodyEditor
            key={body.id || index}
            resourceId={body.id}
            onRemove={() => editor.annotation.body.deleteAtIndex(index)}
            onUpdate={() => pruneEmptySiblings(body.id)}
            compact={compact}
            editorMaxWidth={editorMaxWidth}
          />
        ),
      )}
    </div>
  );
}

function TiptapAnnotationBodyEditor({
  compact,
  editorMaxWidth,
  resourceId,
  onRemove,
  onUpdate,
}: {
  compact?: boolean;
  editorMaxWidth?: string;
  resourceId: string;
  onRemove: () => void;
  onUpdate: () => void;
}) {
  const resourceRef = useMemo(
    () => ({ id: resourceId, type: "ContentResource" as const }),
    [resourceId],
  );
  const editor = useGenericEditor(resourceRef);
  const {
    i18n: { advancedLanguageMode, availableLanguages, defaultLanguage },
  } = useConfig();
  const { language, value } = editor.descriptive;
  const languageValue = language.get();
  const currentLanguage = Array.isArray(languageValue)
    ? languageValue[0] || defaultLanguage || "en"
    : languageValue || defaultLanguage || "en";

  useEffect(() => {
    const nextLanguage = Array.isArray(language.get())
      ? language.get()[0]
      : language.get();
    if (!advancedLanguageMode && nextLanguage !== currentLanguage) {
      language.set(currentLanguage as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedLanguageMode, currentLanguage]);

  return (
    <div
      className="min-w-0 max-w-full overflow-hidden"
      style={editorMaxWidth ? { maxWidth: editorMaxWidth } : undefined}
    >
      <TiptapRichTextLanguageField
        language={currentLanguage}
        languages={availableLanguages}
        value={value.get() || ""}
        onUpdate={(newValue) => {
          value.set(newValue);
          onUpdate();
        }}
        onUpdateLanguage={
          advancedLanguageMode
            ? (newLanguage) => language.set(newLanguage as any)
            : undefined
        }
        onRemove={advancedLanguageMode ? onRemove : undefined}
      />
    </div>
  );
}

function getVisibleItems(items: any[], vault: any) {
  const withIndex = items.map((item, index) => ({ item, index }));
  const nonEmpty = withIndex.filter(
    ({ item }) => !isAnnotationEmpty(item, vault),
  );
  return nonEmpty.length ? nonEmpty : withIndex.slice(0, 1);
}

function getVisibleBodyRefs(items: any[], vault: any) {
  const withIndex = items.map((item, index) => ({ item, index }));
  const nonEmpty = withIndex.filter(({ item }) => !isBodyRefEmpty(item, vault));
  return nonEmpty.length ? nonEmpty : withIndex.slice(0, 1);
}

function filterEmptyAnnotations(items: any[], vault: any, keepId?: string) {
  const filtered = items.filter(
    (item) => item?.id === keepId || !isAnnotationEmpty(item, vault),
  );
  return filtered.length ? filtered : items.slice(0, 1);
}

function filterEmptyRefs(items: any[], vault: any, keepId?: string) {
  const filtered = items.filter(
    (item) => item?.id === keepId || !isBodyRefEmpty(item, vault),
  );
  return filtered.length ? filtered : items.slice(0, 1);
}

function isAnnotationEmpty(annotationRef: any, vault: any) {
  const annotation = resolveResource(annotationRef, vault);
  const bodies = toArray(annotation?.body);
  if (!bodies.length) {
    return true;
  }
  return bodies.every((body) => isBodyRefEmpty(body, vault));
}

function isBodyRefEmpty(bodyRef: any, vault: any) {
  const body = resolveResource(bodyRef, vault);
  if (!body) {
    return true;
  }
  return isHtmlEmpty(body.value || "");
}

function isHtmlEmpty(value: string) {
  const html = String(value || "");
  if (/<img\b/i.test(html)) {
    return false;
  }
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, "")
      .trim() === ""
  );
}

function resolveResource(resource: any, vault: any) {
  if (!resource?.id || resource.value || resource.items || resource.body) {
    return resource;
  }

  return (
    vault.get(resource as any, { skipSelfReturn: false } as any) || resource
  );
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}
