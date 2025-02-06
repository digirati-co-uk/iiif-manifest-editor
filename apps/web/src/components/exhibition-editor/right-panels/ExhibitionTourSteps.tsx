import { EditorDefinition, ResourceEditingProvider } from "@manifest-editor/shell";
import { getGridStats } from "../helpers";
import {
  AnnotationContext,
  AnnotationPageContext,
  LocaleString,
  useAnnotation,
  useAnnotationPage,
  useCanvas,
} from "react-iiif-vault";
import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { LanguageMapEditor, useAnnotationInfo } from "@manifest-editor/editors";
import { useMemo, useState } from "react";
import { ListEditIcon } from "@manifest-editor/manifest-preset/components";
import { Button } from "react-aria-components";
import { CloseIcon } from "@manifest-editor/ui/madoc/components/icons/CloseIcon";

export const exhibitionTourSteps: EditorDefinition = {
  id: "@exhibition/tour-steps",
  supports: {
    edit: true,
    properties: ["annotations"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      const full = vault.get(resource);
      const stats = getGridStats(full.behavior);

      if (full.type === "Canvas" && !stats.isInfo && !stats.isBottom) {
        return true;
      }
      return false;
    },
  },
  label: "Tour steps",
  component: () => <ExhibitionRightPanel />,
};

function ExhibitionRightPanel() {
  const canvas = useCanvas();
  if (!canvas) return null;

  const firstAnnotationPage = canvas.annotations[0];

  if (!firstAnnotationPage) {
    return <div>No annotation page - create one?</div>;
  }

  return (
    <Sidebar>
      <SidebarContent padding>
        <ResourceEditingProvider resource={canvas}>
          <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
            <div className="flex flex-col gap-4">
              <AnnotationPageTourSteps />

              <div className="border border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500">
                + Add new step
              </div>
            </div>
          </AnnotationPageContext>
        </ResourceEditingProvider>
      </SidebarContent>
    </Sidebar>
  );
}

function AnnotationPageTourSteps() {
  const page = useAnnotationPage();

  if (!page) {
    return null;
  }

  return (
    <>
      {page.items.map((annotation) => (
        <AnnotationContext annotation={annotation.id} key={annotation.id}>
          <AnnotationEditor />
        </AnnotationContext>
      ))}
    </>
  );
}

function AnnotationEditor() {
  const [annotation, { annotationTarget, highlightProps }] = useAnnotationInfo();

  const resource = useMemo(() => {
    if (annotationTarget) {
      return { id: annotationTarget, type: "Annotation" };
    }
    return { id: annotation?.id as string, type: "Annotation" };
  }, [annotation?.id, annotationTarget]);

  if (annotationTarget) {
    return (
      <ResourceEditingProvider resource={resource}>
        <AnnotationContext annotation={annotationTarget}>
          <PaintingAnnotationEditor highlightProps={highlightProps} />
        </AnnotationContext>
      </ResourceEditingProvider>
    );
  }

  return (
    <ResourceEditingProvider resource={resource}>
      <NormalAnnotationEditor highlightProps={highlightProps} />
    </ResourceEditingProvider>
  );
}

function NormalAnnotationEditor({ highlightProps }: { highlightProps: any }) {
  // This is an annotatino within a page.
  return (
    <div
      {...highlightProps}
      className="border border-gray-300 hover:border-me-500 shadow-sm rounded p-4 bg-white relative"
    >
      <div>NORMAL STEP</div>
      <div>LABEL</div>
      <div>Summary</div>
      <div>EDIT TARGET</div>

      <div className="absolute -bottom-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}

function PaintingAnnotationEditor({ highlightProps }: { highlightProps: any }) {
  const annotation = useAnnotation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      {...highlightProps}
      onClick={() => setIsOpen((o) => !o)}
      className="border border-gray-300 hover:border-me-500 shadow-sm rounded p-2 bg-white relative"
    >
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          {isOpen ? (
            <>
              <LanguageMapEditor dispatchType="label" />
              <LanguageMapEditor dispatchType="summary" />
            </>
          ) : (
            <LocaleString as="div">{annotation?.label}</LocaleString>
          )}
        </div>
        <div>
          <Button onPress={() => setIsOpen((o) => !o)}>{isOpen ? <CloseIcon /> : <ListEditIcon />}</Button>
        </div>
      </div>

      <div>EDIT TARGET</div>

      <div className="absolute -bottom-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}
