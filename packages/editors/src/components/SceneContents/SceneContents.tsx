import type { Vault4 } from "@iiif/helpers/vault-4";
import { AddIcon, ListEditIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditingStack, useGenericEditor } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useMemo, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault/presentation-4";
import { useInStack } from "../../helpers";
import { describeSceneAnnotation, type SceneItemGroup } from "../../helpers/scene-items";

const groupOrder: SceneItemGroup[] = ["Objects", "Cameras", "Lights", "Audio", "Other"];

export function SceneContents() {
  const scene = useInStack("Scene");
  const current = useEditingResource();
  const editingStack = useEditingStack();
  const vault = useVault() as unknown as Vault4;
  const sceneRef = scene?.resource.source;
  const [editingItems, setEditingItems] = useState(false);
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
  const [canCreate, actions] = useCreator(pageRef, "items", "Annotation", sceneRef as any, { isPainting: true });
  const items = useMemo(
    () => resolved.annotations.map((annotation, index) => describeSceneAnnotation(annotation, vault, index)),
    [resolved.annotations, vault]
  );
  const selectedId = current?.resource.source.type === "Annotation" ? current.resource.source.id : null;

  return (
    <Sidebar>
      <SidebarHeader
        title="Scene contents"
        actions={[
          {
            icon: <ListEditIcon />,
            title: "Edit Scene items",
            toggled: editingItems,
            onClick: () => setEditingItems((value) => !value),
          },
          {
            icon: <AddIcon />,
            title: "Add to Scene",
            disabled: !canCreate,
            onClick: () => actions.create(),
          },
        ]}
      />
      <SidebarContent className="pb-0">
        {!sceneRef ? (
          <EmptyState>Select a Scene to see its contents</EmptyState>
        ) : (
          <div className="py-1">
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
                      const hidden = (item.resource?.behavior || []).includes("hidden");
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
                          {item.group === "Lights" ? (
                            <button
                              aria-label={`${hidden ? "Turn on" : "Turn off"} ${item.label}`}
                              aria-pressed={!hidden}
                              className={`mr-1 w-10 rounded border px-1.5 py-1 text-xs ${
                                hidden
                                  ? "border-gray-300 bg-white text-gray-500"
                                  : "border-green-700 bg-green-50 text-green-800"
                              }`}
                              title={`${hidden ? "Turn on" : "Turn off"} light`}
                              type="button"
                              onClick={() => {
                                const behavior = (item.resource?.behavior || []) as string[];
                                vault.modifyEntityField(
                                  { id: item.resource.id, type: "ContentResource" } as any,
                                  "behavior",
                                  hidden ? behavior.filter((value) => value !== "hidden") : [...behavior, "hidden"]
                                );
                              }}
                            >
                              {hidden ? "Off" : "On"}
                            </button>
                          ) : null}
                          {editingItems ? (
                            <button
                              aria-label={`Remove ${item.label}`}
                              className="mr-1 flex h-7 w-7 items-center justify-center rounded text-lg text-gray-500 hover:bg-red-50 hover:text-red-700"
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
                          ) : null}
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
        )}
      </SidebarContent>
    </Sidebar>
  );
}
