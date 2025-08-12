import { type AnnotationPanel, useAtlasStore, useGenericEditor, useLayoutState } from "@manifest-editor/shell";
import {
  AnnotationContext,
  AnnotationPageContext,
  useAnnotation,
  useAnnotationPage,
  useCanvas,
} from "react-iiif-vault";
import { useStore } from "zustand";
import { AtlasRenderBoxSelector } from "../components/AtlasRenderBoxSelector";
import { AtlasRenderSVGSelector } from "../components/AtlasRenderSVGSelector";

export const tourStepAnnotations: AnnotationPanel = {
  id: "@exhibition/tour-step-annotations",
  label: "Tour steps",
  render: () => <TourStepAnnotations />,
};

function TourStepAnnotations() {
  const canvas = useCanvas();
  const store = useAtlasStore();
  const toolEnabled = useStore(store, (s) => s.tool.enabled);
  const { rightPanel } = useLayoutState();
  const isRightPanel = rightPanel.current === "@manifest-editor/editor";
  const isTour = isRightPanel && rightPanel.state?.currentTab?.startsWith("@exhibition/tour-steps");
  const firstAnnotationPage = canvas?.annotations[0];

  if (!isTour || !canvas || toolEnabled || !firstAnnotationPage) {
    return null;
  }

  return (
    <>
      <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
        <ViewAnnotationPage />
      </AnnotationPageContext>
    </>
  );
}

function ViewAnnotationPage() {
  const page = useAnnotationPage();

  return (
    <>
      {page?.items?.map((item) => {
        return (
          <AnnotationContext annotation={item.id} key={item.id}>
            <ViewAnnotation />
          </AnnotationContext>
        );
      })}
    </>
  );
}

function ViewAnnotation() {
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation);
  const target = editor.annotation.target.getParsedSelector();

  if (!target || !annotation) return null;

  if (target.type === "BoxSelector") {
    return <AtlasRenderBoxSelector id={annotation.id} target={target} />;
  }

  if (target.type === "SvgSelector") {
    return <AtlasRenderSVGSelector id={annotation.id} target={target} />;
  }

  return null;
}
