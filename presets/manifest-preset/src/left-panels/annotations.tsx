import type { LayoutPanel } from "@manifest-editor/shell";
import { useAtlasStore, useRequestAnnotation } from "react-iiif-vault";
import { useStore } from "zustand";

export const annotationsPanel: LayoutPanel = {
  id: "annotations",
  label: "Annotations",
  icon: <AnnotationsIcon />,
  render: (state, ctx, app) => {
    return <AnnotationsPanel />;
  },
};

function AnnotationsPanel() {
  // - Create page: There is no Annotation page OR only external annotation pages
  // - Listing existing annotations
  // - Creating new annotation
  // - Editing an annotation inline

  return <AnnotationDebug />;
}

function AnnotationDebug() {
  const store = useAtlasStore();
  const { polygon, polygonState, polygons, ...data } = useStore(store, (s) => s);
  return (
    <div>
      Hello annotations
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function MakeAnno() {
  const {} = useRequestAnnotation();
}

export function AnnotationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.17l-.59.59l-.58.58V4h16zm-9.5-2H18v-2h-5.5zm3.86-5.87c.2-.2.2-.51 0-.71l-1.77-1.77c-.2-.2-.51-.2-.71 0L6 11.53V14h2.47z"
      />
    </svg>
  );
}
