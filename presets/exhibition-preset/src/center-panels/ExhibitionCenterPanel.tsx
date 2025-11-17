import { EditTextIcon } from "@manifest-editor/components";
import { CanvasPanelEditor, CanvasPanelViewer } from "@manifest-editor/editors";
import {
  EditingStackContext,
  InlineEditingStack,
  type LayoutPanel,
  useLayoutActions,
  usePanelActions,
} from "@manifest-editor/shell";
import { DelftExhibition } from "exhibition-viewer";
import { type EditorHooks, EditorHooksProvider } from "exhibition-viewer/library";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { CanvasContext, useManifest, useVault } from "react-iiif-vault";

export const exhibitionCenterPanel: LayoutPanel = {
  id: "@exhibitions/center-panel", // We are overriding the default canvas listing panel
  label: "Exhibition editor",
  icon: null,
  render: () => <ExhibitionCenterPanel />,
  options: {
    minWidth: 350,
    maxWidth: 350,
  },
};

function ExhibitionCenterPanel() {
  const manifest = useManifest();
  const vault = useVault();
  const [scale, setScale] = useState(0.8);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { edit, leftPanel } = useLayoutActions();

  const hooks = useMemo(() => {
    return {
      localeStringEditor: (props) => {
        return (
          <span className="inline-flex items-center hover:ring-4 hover:ring-me-primary-500">
            {props.original}
            <Button className="py-1 px-2 inline-block" onPress={() => edit(props.resource)}>
              <EditTextIcon className="text-xl" />
            </Button>
          </span>
        );
      },
      canvasPreviewEditor: (props) => {
        return (
          <div className="w-full h-full flex-1 flex relative">
            {props.original}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                edit(props.resource);
                leftPanel.open({ id: "canvas-listing", open: true });
              }}
              className="absolute top-5 right-5 bg-white text-black p-2 rounded z-40"
            >
              EDIT
            </button>
          </div>
        );
      },
    } satisfies EditorHooks;
  }, []);

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const wrapperWidth = wrapperRef.current.offsetWidth;
      const initialScale = wrapperWidth / 1200;
      setScale(Math.max(1, initialScale));
    }
  }, []);

  if (!manifest) return null;

  return (
    <div ref={wrapperRef} className="overflow-y-auto delft-exhibition">
      <EditorHooksProvider hooks={hooks}>
        <DelftExhibition
          key={scale}
          skipLoadManifest
          customVault={vault}
          manifest={manifest.id}
          options={{
            disablePresentation: true,
            hideTableOfContents: true,
            hideTitle: true,
            alternativeImageMode: true,
          }}
        />
      </EditorHooksProvider>
    </div>
  );
}
