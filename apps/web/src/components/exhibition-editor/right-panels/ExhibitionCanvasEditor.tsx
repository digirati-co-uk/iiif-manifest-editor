import { EditorDefinition, ResourceEditingProvider, useEditingResource, useEditor } from "@manifest-editor/shell";
import { getClassName, getGridStats } from "../helpers";
import { DimensionsTriplet, InputContainer, LanguageMapEditor, PaintingAnnotationList } from "@manifest-editor/editors";
import { AnnotationPageContext, useCanvas } from "react-iiif-vault";
import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { AspectRatioWarning } from "../components/AspectRatioWarning";

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
  const { structural, technical } = useEditor();
  const { items, annotations } = structural;
  const { width, height } = technical;
  const pages = items.get();
  const page = pages[0];

  if (!canvas || !page) return null;

  const { isLeft, isRight, isBottom } = getGridStats(canvas?.behavior);

  return (
    <Sidebar>
      <SidebarContent padding>
        <ResourceEditingProvider resource={canvas}>
          <LanguageMapEditor dispatchType="label" disableMultiline />

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

          <AnnotationPageContext annotationPage={page.id}>
            <PaintingAnnotationList createFilter="image" />
          </AnnotationPageContext>
        </ResourceEditingProvider>
      </SidebarContent>
    </Sidebar>
  );
}
