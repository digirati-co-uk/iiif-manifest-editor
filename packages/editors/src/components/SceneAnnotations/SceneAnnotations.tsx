import {
  ActionButton,
  AddIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import {
  BaseAnnotationCreator,
  useInlineCreator,
} from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useMemo, useState } from "react";
import { useVaultSelector } from "react-iiif-vault/presentation-4";
import {
  sceneAnnotationCreation,
  scenePointTarget,
  useSceneAnnotationCreation,
} from "../../helpers/scene-annotation-creation";
import { useInStack } from "../../helpers";

export function SceneAnnotations() {
  const scene = useInStack("Scene");
  const sceneRef = scene?.resource.source;
  const creator = useInlineCreator();
  const draft = useSceneAnnotationCreation();
  const [creatingPage, setCreatingPage] = useState(false);
  const resolved = useVaultSelector(
    (_, vault) => {
      if (!sceneRef) return { page: undefined, annotationCount: 0 };
      const currentScene = vault.get(sceneRef as any, {
        skipSelfReturn: false,
      }) as any;
      const page = currentScene?.annotations?.[0]
        ? vault.get(currentScene.annotations[0], {
            parent: currentScene,
            skipSelfReturn: false,
          })
        : undefined;
      return { page, annotationCount: (page as any)?.items?.length || 0 };
    },
    [sceneRef?.id],
  );
  const currentDraft = draft?.sceneId === sceneRef?.id ? draft : null;
  const pointLabel = useMemo(
    () => currentDraft?.point?.map((value) => value.toFixed(3)).join(", "),
    [currentDraft?.point],
  );

  const begin = async () => {
    if (!sceneRef || creatingPage) return;
    let pageId = (resolved.page as any)?.id as string | undefined;
    if (!pageId) {
      setCreatingPage(true);
      try {
        const created = (await creator.create(
          "@manifest-editor/empty-annotation-page",
          { label: { en: ["Scene annotations"] } },
          {
            target: sceneRef,
            targetType: "AnnotationPage",
            parent: { property: "annotations", resource: sceneRef },
          },
        )) as any;
        pageId = (Array.isArray(created) ? created[0] : created)?.id;
      } finally {
        setCreatingPage(false);
      }
    }
    if (pageId) sceneAnnotationCreation.start(sceneRef.id, pageId);
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
              {resolved.annotationCount
                ? ` This Scene has ${resolved.annotationCount} annotation${resolved.annotationCount === 1 ? "" : "s"}.`
                : ""}
            </p>
            <ActionButton
              large
              primary
              isDisabled={creatingPage}
              onPress={begin}
            >
              <AddIcon className="text-xl" />
              {creatingPage ? "Preparing…" : "Add point annotation"}
            </ActionButton>
          </>
        ) : !currentDraft.point ? (
          <>
            <p className="text-sm text-gray-700">
              Click a point on a model surface in the Scene.
            </p>
            <ActionButton onPress={() => sceneAnnotationCreation.cancel()}>
              Cancel
            </ActionButton>
          </>
        ) : (
          <div className="rounded border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-2 text-sm">
              <span title={pointLabel}>Point: {pointLabel}</span>
              <button
                className="text-me-600 hover:underline"
                type="button"
                onClick={() => sceneAnnotationCreation.start(sceneRef.id, currentDraft.pageId)}
              >
                Pick again
              </button>
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
                    getSerialisedSelector: () =>
                      scenePointTarget(sceneRef.id, currentDraft.point!).selector,
                    motivation: "commenting",
                  },
                } as any
              }
            />
            <div className="p-2 pt-0">
              <ActionButton onPress={() => sceneAnnotationCreation.cancel()}>
                Cancel
              </ActionButton>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
