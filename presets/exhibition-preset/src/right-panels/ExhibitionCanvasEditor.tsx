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
import { isEditableExhibitionCanvas, isExhibitionItem } from "../helpers";
import { ExhibitionItemConversion } from "../components/ExhibitionItemConversion";

export const exhibitionCanvasEditor: EditorDefinition = {
  id: "@exhibition/right-panel-editor",
  supports: {
    edit: true,
    properties: ["label", "summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) =>
      isEditableExhibitionCanvas(resource, vault),
  },
  label: "Exhibition",
  component: () => <ExhibitionCanvasAdvancedPanel />,
};

export function ExhibitionCanvasAdvancedPanel() {
  return (
    <Sidebar>
      <SidebarContent padding>
        <ExhibitionCanvasAdvancedContent />
      </SidebarContent>
    </Sidebar>
  );
}

export function ExhibitionCanvasAdvancedContent() {
  const canvas = useCanvas();
  const resource = useEditingResource();
  const { structural, descriptive } = useEditor();
  const { items } = structural;
  const { thumbnail } = descriptive;
  const pages = items.get();
  const page = pages[0];

  const isAnExhibitionCanvas = isExhibitionItem(canvas);

  if (!canvas || !page || !resource)
    return <div className="p-8">Canvas, page, or resource not found</div>;

  return (
    <ResourceEditingProvider resource={canvas}>
      {!isAnExhibitionCanvas ? <ExhibitionItemConversion /> : null}

      <LanguageMapEditor dispatchType="label" disableMultiline disallowHTML />
      <LanguageMapEditor dispatchType="summary" />

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
  );
}
