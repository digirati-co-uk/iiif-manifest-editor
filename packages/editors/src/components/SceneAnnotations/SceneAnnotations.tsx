import {
  ActionButton,
  AddIcon,
  IconButton,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  TargetIcon,
} from "@manifest-editor/components";
import { BaseAnnotationCreator, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useEffect, useMemo, useState } from "react";
import { useVaultSelector } from "react-iiif-vault/presentation-4";
import {
  sceneAnnotationCreation,
  scenePointTarget,
  useSceneAnnotationCreation,
} from "../../helpers/scene-annotation-creation";
import { describeSceneAnnotation, getActivationTargetIds, isActivatingAnnotation } from "../../helpers/scene-items";
import { useInStack } from "../../helpers";

export function SceneAnnotations() {
  const scene = useInStack("Scene");
  const sceneRef = scene?.resource.source;
  const creator = useInlineCreator();
  const layout = useLayoutActions();
  const draft = useSceneAnnotationCreation();
  const [creatingPage, setCreatingPage] = useState(false);
  const resolved = useVaultSelector(
    (_, vault) => {
      if (!sceneRef) return { page: undefined, annotations: [] as any[] };
      const currentScene = vault.get(sceneRef as any, {
        skipSelfReturn: false,
      }) as any;
      const pages = (vault.get([...(currentScene?.annotations || [])], { parent: currentScene }) || []) as any[];
      const editablePages = pages.filter((page) => Array.isArray(page?.items));
      const pageEntries = editablePages.map((page) => ({
        page,
        annotations: ((vault.get([...(page.items || [])], { parent: page }) || []) as any[]).map(
          (annotation, index) => ({ annotation, index, page })
        ),
      }));
      const allEntries = pageEntries.flatMap((entry) => entry.annotations);
      const activationTargetIds = getActivationTargetIds(allEntries.map(({ annotation }) => annotation));
      const visibleEntries = allEntries.filter(
        ({ annotation }) => !isActivatingAnnotation(annotation) && !activationTargetIds.has(annotation.id)
      );
      const page =
        pageEntries.find(({ page: candidate }) => candidate.label?.en?.includes("Scene annotations"))?.page ||
        pageEntries.find(({ annotations }) =>
          annotations.some(
            ({ annotation }) => !isActivatingAnnotation(annotation) && !activationTargetIds.has(annotation.id)
          )
        )?.page;
      return {
        page,
        annotations: visibleEntries.map((entry, index) => ({
          ...entry,
          label: describeSceneAnnotation(entry.annotation, vault, index).label,
        })),
      };
    },
    [sceneRef?.id]
  );
  const currentDraft = draft?.sceneId === sceneRef?.id ? draft : null;
  const pointLabel = useMemo(
    () => currentDraft?.point?.map((value) => value.toFixed(3)).join(", "),
    [currentDraft?.point]
  );

  useEffect(() => () => sceneAnnotationCreation.cancel(), [sceneRef?.id]);

  useEffect(() => {
    if (!sceneRef || !currentDraft?.point || currentDraft.pageId || creatingPage) return;
    setCreatingPage(true);
    creator
      .create(
        "@manifest-editor/empty-annotation-page",
        { label: { en: ["Scene annotations"] } },
        {
          target: sceneRef,
          targetType: "AnnotationPage",
          parent: { property: "annotations", resource: sceneRef },
        }
      )
      .then((created: any) => {
        const pageId = (Array.isArray(created) ? created[0] : created)?.id;
        if (pageId) sceneAnnotationCreation.setPage(sceneRef.id, pageId);
      })
      .finally(() => setCreatingPage(false));
  }, [creator, creatingPage, currentDraft?.pageId, currentDraft?.point, sceneRef]);

  const begin = () => {
    if (!sceneRef || creatingPage) return;
    sceneAnnotationCreation.start(sceneRef.id, (resolved.page as any)?.id || null);
  };

  if (!sceneRef) {
    return <EmptyState>Select a Scene to add 3D annotations</EmptyState>;
  }

  return (
    <Sidebar>
      <SidebarHeader
        title="3D annotations"
        actions={[
          {
            icon: <AddIcon />,
            title: "Add point annotation",
            disabled: !!currentDraft || creatingPage,
            onClick: begin,
          },
        ]}
      />
      <SidebarContent className="flex flex-col gap-4 p-3">
        {!currentDraft ? (
          <>
            <p className="text-sm text-gray-600">
              Add HTML annotations anchored to points on 3D model surfaces.
              {resolved.annotations.length
                ? ` This Scene has ${resolved.annotations.length} annotation${resolved.annotations.length === 1 ? "" : "s"}.`
                : ""}
            </p>
            {resolved.annotations.length ? (
              <section>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Annotations</h2>
                <ul aria-label="Scene annotations" className="overflow-hidden rounded border border-gray-200 bg-white">
                  {resolved.annotations.map(({ annotation, index, label, page: annotationPage }) => (
                    <li
                      className="flex items-center border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                      key={annotation.id}
                    >
                      <button
                        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
                        type="button"
                        onClick={() =>
                          layout.edit(
                            { id: annotation.id, type: "Annotation" } as any,
                            {
                              parent: { id: annotationPage.id, type: "AnnotationPage" } as any,
                              property: "items",
                              index,
                            },
                            { forceOpen: true }
                          )
                        }
                      >
                        <TargetIcon className="shrink-0 text-base text-gray-400" />
                        <span className="block truncate text-sm text-gray-900">{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <ActionButton large primary isDisabled={creatingPage} onPress={begin}>
              <AddIcon className="text-xl" />
              {creatingPage ? "Preparing…" : "Add point annotation"}
            </ActionButton>
          </>
        ) : !currentDraft.point ? (
          <>
            <p className="text-sm text-gray-700">Click a point on a model surface in the Scene.</p>
            <ActionButton onPress={() => sceneAnnotationCreation.cancel()}>Cancel</ActionButton>
          </>
        ) : !currentDraft.pageId ? (
          <p className="text-sm text-gray-700">Preparing the Scene annotation page…</p>
        ) : (
          <div className="rounded border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-2 text-sm">
              <span className="truncate" title={pointLabel}>
                Point: {pointLabel}
              </span>
              <IconButton
                label="Pick again"
                className="text-base"
                onPress={() => sceneAnnotationCreation.start(sceneRef.id, currentDraft.pageId)}
              >
                <TargetIcon />
              </IconButton>
            </div>
            <BaseAnnotationCreator
              key={pointLabel}
              onCreate={() => sceneAnnotationCreation.cancel()}
              resource={
                {
                  property: "items",
                  type: "Annotation",
                  isPainting: false,
                  parent: {
                    id: currentDraft.pageId,
                    type: "AnnotationPage",
                  },
                  target: sceneRef,
                  initialData: {
                    showEmptyForm: true,
                    getSerialisedSelector: () => scenePointTarget(sceneRef.id, currentDraft.point!).selector,
                    motivation: "commenting",
                  },
                } as any
              }
            />
            <div className="p-2 pt-0">
              <ActionButton onPress={() => sceneAnnotationCreation.cancel()}>Cancel</ActionButton>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
