import { ActionButton } from "@manifest-editor/components";
import { TiptapRichTextLanguageField } from "@manifest-editor/editors";
import { type CanvasEditorDefinition, useConfig, useGenericEditor, useInlineCreator } from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo } from "react";
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
import { getGridStats, getHeightWidthRatio } from "../helpers";

export const infoBlockEditor: CanvasEditorDefinition = {
  id: "info-block-editor",
  label: "info Block Editor",
  component: (strategy) => <InfoBlockEditor strategy={strategy as TextualContentStrategy} />,
  supports: {
    strategy: (strategy, _resource, _vault) => {
      if (strategy.type !== "textual-content") {
        return false;
      }
      return true;
    },
  },
};

function InfoBlockEditor({ strategy }: { strategy: TextualContentStrategy }) {
  const canvas = useCanvas();
  const behavior = canvas?.behavior || [];
  const dims = getHeightWidthRatio(behavior);
  const hasDimension = Boolean(dims.h && dims.w);
  const { isBottom, isLeft, isRight } = getGridStats(behavior);
  const compact = hasDimension && dims.w <= 6;
  const annotationPage = useVaultSelector((_, vault) => (canvas?.items[0] ? vault.get(canvas.items[0]) : null));
  const longSummaries = useVaultSelector((_, vault) =>
    canvas?.annotations[0] ? vault.get(canvas?.annotations[0]!) : null,
  );

  // For narrow columns (w <= 6), cap the editor width so it doesn't sprawl
  const editorMaxWidth = compact ? "28rem" : undefined;

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto bg-white">
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
      />

      <SummarySection
        annotationPage={longSummaries}
        compact={compact}
        heading="Long summary"
        panelClassName={twMerge(compact ? "p-3" : "p-5")}
        parentProperty="annotations"
      />
    </div>
  );
}

function SummarySection({
  annotationPage,
  compact,
  editorMaxWidth,
  fallbackText,
  heading,
  panelClassName,
  parentProperty,
}: {
  annotationPage: any;
  compact?: boolean;
  editorMaxWidth?: string;
  fallbackText?: any;
  heading: string;
  panelClassName?: string;
  parentProperty: "items" | "annotations";
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
        body: { [defaultLanguage || "en"]: [""] },
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

  return (
    <section className={twMerge("min-w-0 max-w-full", panelClassName)}>
      <div className={twMerge("flex items-center justify-between gap-3", visibleItems.length ? "mb-3" : "mb-0")}>
        <h2
          className={twMerge(
            "font-semibold tracking-tight text-gray-700",
            compact ? "text-xs uppercase" : "text-sm uppercase tracking-wide",
          )}
        >
          {heading}
        </h2>
        {!visibleItems.length && (
          <ActionButton primary onPress={createSummaryAnnotation}>
            {page ? "Add text" : "Add"}
          </ActionButton>
        )}
      </div>

      {!page && fallbackText ? (
        <div className="mt-2 text-sm text-gray-600">
          <LocaleString enableDangerouslySetInnerHTML>{fallbackText}</LocaleString>
        </div>
      ) : null}

      {visibleItems.length ? (
        <div className="min-w-0 max-w-full">
          {visibleItems.map(({ item: annotation, index }) => (
            <AnnotationContext key={annotation.id + index} annotation={annotation.id}>
              <AnnotationEditor
                compact={compact}
                editorMaxWidth={editorMaxWidth}
                pageItems={items}
                pageRef={{ id: page.id, type: "AnnotationPage" }}
                onRemoveAnnotation={() => {
                  vault.modifyEntityField(
                    { id: page.id, type: "AnnotationPage" },
                    "items",
                    items.filter((_item: any, itemIndex: number) => itemIndex !== index),
                  );
                }}
              />
            </AnnotationContext>
          ))}
        </div>
      ) : page ? (
        <div className={twMerge("mt-2 text-sm text-gray-400 italic", compact ? "" : "")}>No text added yet.</div>
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
}: {
  compact?: boolean;
  editorMaxWidth?: string;
  onRemoveAnnotation: () => void;
  pageItems: any[];
  pageRef: { id: string; type: "AnnotationPage" };
}) {
  const annotation = useAnnotation();
  const vault = useVault();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);

  if (!annotation) {
    return null;
  }

  const visibleBodies = getVisibleBodyRefs(bodies, vault);

  const pruneEmptySiblings = useCallback(
    (currentBodyId: string) => {
      const nextBodies = filterEmptyRefs(bodies, vault, currentBodyId);
      if (nextBodies.length !== bodies.length) {
        vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "body", nextBodies);
      }

      const nextPageItems = filterEmptyAnnotations(pageItems, vault, annotation.id);
      if (nextPageItems.length !== pageItems.length) {
        vault.modifyEntityField(pageRef, "items", nextPageItems);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [annotation.id, pageRef.id, pageItems, vault],
  );

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      {visibleBodies.map(({ item: body, index }) => (
        <TiptapAnnotationBodyEditor
          key={body.id || index}
          resourceId={body.id}
          onRemove={() => editor.annotation.body.deleteAtIndex(index)}
          onUpdate={() => pruneEmptySiblings(body.id)}
          compact={compact}
          editorMaxWidth={editorMaxWidth}
        />
      ))}
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
  const resourceRef = useMemo(() => ({ id: resourceId, type: "ContentResource" as const }), [resourceId]);
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
    const nextLanguage = Array.isArray(language.get()) ? language.get()[0] : language.get();
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
        onUpdateLanguage={advancedLanguageMode ? (newLanguage) => language.set(newLanguage as any) : undefined}
        onRemove={advancedLanguageMode ? onRemove : undefined}
      />
    </div>
  );
}

function getVisibleItems(items: any[], vault: any) {
  const withIndex = items.map((item, index) => ({ item, index }));
  const nonEmpty = withIndex.filter(({ item }) => !isAnnotationEmpty(item, vault));
  return nonEmpty.length ? nonEmpty : withIndex.slice(0, 1);
}

function getVisibleBodyRefs(items: any[], vault: any) {
  const withIndex = items.map((item, index) => ({ item, index }));
  const nonEmpty = withIndex.filter(({ item }) => !isBodyRefEmpty(item, vault));
  return nonEmpty.length ? nonEmpty : withIndex.slice(0, 1);
}

function filterEmptyAnnotations(items: any[], vault: any, keepId?: string) {
  const filtered = items.filter((item) => item?.id === keepId || !isAnnotationEmpty(item, vault));
  return filtered.length ? filtered : items.slice(0, 1);
}

function filterEmptyRefs(items: any[], vault: any, keepId?: string) {
  const filtered = items.filter((item) => item?.id === keepId || !isBodyRefEmpty(item, vault));
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

  return vault.get(resource as any, { skipSelfReturn: false } as any) || resource;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}
