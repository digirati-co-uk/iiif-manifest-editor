import { Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  DimensionsTriplet,
  InputContainer,
  LanguageMapEditor,
  LinkingPropertyList,
  PaintingAnnotationList,
  createAppActions,
} from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useEditingResource,
  useEditor,
} from "@manifest-editor/shell";
import { AnnotationPageContext, useCanvas } from "react-iiif-vault";
import { AspectRatioWarning } from "../components/AspectRatioWarning";
import { getGridStats } from "../helpers";

export const exhibitionCanvasEditor: EditorDefinition = {
  id: "@exhibition/right-panel-editor",
  supports: {
    edit: true,
    properties: ["label", "summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      const full = vault.get(resource);
      const stats = getGridStats(full.behavior);

      if (full.type === "Canvas" && !stats.isInfo) {
        return true;
      }
      return false;
    },
  },
  label: "Exhibition",
  component: () => <ExhibitionRightPanel />,
};

function ExhibitionRightPanel() {
  const canvas = useCanvas();
  const resource = useEditingResource();
  const { structural, technical, descriptive } = useEditor();
  const { items } = structural;
  const { thumbnail } = descriptive;
  const { width, height } = technical;
  const pages = items.get();
  const page = pages[0];

  if (!canvas || !page || !resource) return null;

  return (
    <Sidebar>
      <SidebarContent padding>
        <ResourceEditingProvider resource={canvas}>
          <LanguageMapEditor dispatchType="label" disableMultiline dissalowHTML />

          <div>
            <InputContainer $wide>
              <DimensionsTriplet
                widthId={width.containerId()}
                width={width.get() || 0}
                changeWidth={(v) => width.set(v)}
                heightId={height.containerId()}
                height={height.get() || 0}
                changeHeight={(v) => height.set(v)}
              />
              <div>
                <AspectRatioWarning />
              </div>
            </InputContainer>
          </div>

          <LinkingPropertyList
            containerId={thumbnail.containerId()}
            label="Thumbnail"
            property="thumbnail"
            items={thumbnail.get()}
            singleMode
            reorder={(ctx) => thumbnail.reorder(ctx.startIndex, ctx.endIndex)}
            createActions={createAppActions(thumbnail)}
            creationType="ContentResource"
            emptyLabel="No thumbnail"
            parent={resource?.resource}
          />

          <AnnotationPageContext annotationPage={page.id}>
            <PaintingAnnotationList createFilter="image" />
          </AnnotationPageContext>
        </ResourceEditingProvider>
      </SidebarContent>
    </Sidebar>
  );
}
