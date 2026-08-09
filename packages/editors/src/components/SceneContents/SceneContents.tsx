import type { Vault4 } from "@iiif/helpers/vault-4";
import { ActionButton, AddIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditingStack, useGenericEditor } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useMemo, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { useInStack } from "../../helpers";
import { describeSceneAnnotation, type SceneItemGroup } from "../../helpers/scene-items";

const groupOrder: SceneItemGroup[] = ["Objects", "Cameras", "Lights", "Audio", "Other"];

export function SceneContents() {
  const scene = useInStack("Scene");
  const current = useEditingResource();
  const editingStack = useEditingStack();
  const vault = useVault() as unknown as Vault4;
  const sceneRef = scene?.resource.source;
  const [addOpen, setAddOpen] = useState(false);
  const resolved = useVaultSelector(
    (_, currentVault) => {
      if (!sceneRef) return { page: undefined, annotations: [] as any[] };
      const currentScene = currentVault.get(sceneRef as any, { skipSelfReturn: false }) as any;
      const page = currentScene?.items?.[0]
        ? currentVault.get(currentScene.items[0], { parent: currentScene, skipSelfReturn: false })
        : undefined;
      return {
        page,
        annotations: page ? ((currentVault.get((page as any).items || [], { parent: page }) || []) as any[]) : [],
      };
    },
    [sceneRef?.id]
  );
  const pageRef = useMemo(
    () => (resolved.page ? { id: (resolved.page as any).id, type: "AnnotationPage" } : undefined),
    [resolved.page]
  );
  const pageEditor = useGenericEditor(pageRef as any, {
    parent: sceneRef as any,
    parentProperty: "items",
    index: 0,
    allowNull: true,
  });
  const [, actions] = useCreator(pageRef, "items", "Annotation", sceneRef as any, { isPainting: true });
  const items = useMemo(
    () => resolved.annotations.map((annotation, index) => describeSceneAnnotation(annotation, vault, index)),
    [resolved.annotations, vault]
  );
  const selectedId = current?.resource.source.type === "Annotation" ? current.resource.source.id : null;

  return (
    <Sidebar>
      <SidebarHeader title="Scene contents" />
      <SidebarContent className="flex min-h-0 flex-col">
        {!sceneRef ? (
          <EmptyState>Select a Scene to see its contents</EmptyState>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto py-1">
              {items.length ? (
                groupOrder.map((group) => {
                  const groupItems = items.filter((item) => item.group === group);
                  if (!groupItems.length) return null;
                  return (
                    <section className="border-b border-gray-200 pb-1" key={group} aria-labelledby={`scene-${group}`}>
                      <h2 className="px-3 pb-1 pt-3 text-xs font-semibold text-gray-500" id={`scene-${group}`}>
                        {group}
                      </h2>
                      {groupItems.map((item) => {
                        const index = resolved.annotations.findIndex(
                          (annotation) => annotation.id === item.annotation.id
                        );
                        const selected = item.annotation.id === selectedId;
                        return (
                          <div
                            className={[
                              "group flex items-center border-l-2 border-transparent hover:bg-gray-50",
                              selected ? "border-l-me-600 bg-gray-100" : "",
                            ].join(" ")}
                            key={item.annotation.id}
                          >
                            <button
                              aria-current={selected || undefined}
                              className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                              type="button"
                              onClick={() => actions.edit(item.annotation, index)}
                            >
                              <span
                                aria-hidden
                                className="flex h-7 w-7 shrink-0 items-center justify-center text-lg text-gray-500"
                              >
                                {item.icon}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-gray-900">{item.label}</span>
                                <span className="block truncate text-xs text-gray-500">{item.typeLabel}</span>
                              </span>
                            </button>
                            <button
                              aria-label={`Remove ${item.label}`}
                              className="mr-1 hidden rounded px-2 py-1 text-lg text-gray-400 hover:bg-gray-200 hover:text-red-700 group-hover:block focus:block"
                              title="Remove from Scene"
                              type="button"
                              onClick={() => {
                                if (!window.confirm(`Remove “${item.label}” from this Scene?`)) return;
                                if (selected) editingStack.edit(scene!, true);
                                pageEditor?.structural.items.deleteAtIndex(index);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">This Scene is empty.</div>
              )}
            </div>
            <div className="relative border-t border-gray-200 p-3">
              {addOpen ? (
                <div className="absolute bottom-full left-3 right-3 mb-1 overflow-hidden rounded border border-gray-300 bg-white shadow-md">
                  <AddItemButton
                    label="3D model from URL"
                    summary="GLB or glTF"
                    onClick={() => {
                      setAddOpen(false);
                      actions.creator("@manifest-editor/model-annotation");
                    }}
                  />
                  <AddItemButton
                    label="Camera"
                    summary="Perspective or orthographic"
                    onClick={() => {
                      setAddOpen(false);
                      actions.creator("@manifest-editor/camera-annotation");
                    }}
                  />
                  <AddItemButton
                    label="Light"
                    summary="Ambient, directional, environment, point, or spot"
                    onClick={() => {
                      setAddOpen(false);
                      actions.creator("@manifest-editor/light-annotation");
                    }}
                  />
                </div>
              ) : null}
              <ActionButton onPress={() => setAddOpen((value) => !value)}>
                <AddIcon /> Add to Scene
              </ActionButton>
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function AddItemButton({ label, summary, onClick }: { label: string; summary: string; onClick: () => void }) {
  return (
    <button
      className="block w-full border-b border-gray-200 px-3 py-2 text-left last:border-0 hover:bg-gray-50"
      type="button"
      onClick={onClick}
    >
      <span className="block text-sm text-gray-900">{label}</span>
      <span className="block text-xs text-gray-500">{summary}</span>
    </button>
  );
}
