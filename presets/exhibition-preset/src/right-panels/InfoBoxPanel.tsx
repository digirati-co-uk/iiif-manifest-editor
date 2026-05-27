import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { BehaviorEditor, DimensionsTriplet, InputContainer, LanguageMapEditor } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider, useEditor, useLocalStorage } from "@manifest-editor/shell";
import { useCanvas, useManifest, useVault } from "react-iiif-vault";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import {
  computeFitWidth,
  type DisplayWidth,
  EditSize,
  getBehaviorWidth,
  SimpleAdvancedToggle,
  SimpleField,
  SimpleFieldLabel,
  SimpleOptionButton,
  simpleLayoutColours,
  textualWidthOptions,
} from "./SlideBehaviours";

type EditingMode = "simple" | "advanced";

const storageKey = "exhibition-info-box-mode";

export const infoBoxWorkbenchEditor: EditorDefinition = {
  id: "@exhibition/info-box-editor",
  supports: {
    edit: true,
    properties: ["label", "behavior"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      return isInfoBoxCanvas(resource as any, vault);
    },
  },
  label: "Text box",
  component: () => <InfoBoxPanel />,
};

export function InfoBoxPanel() {
  const [mode, setMode] = useLocalStorage<EditingMode>(storageKey, "simple");
  const canvas = useCanvas();
  const vault = useVault();
  const manifest = useManifest();
  const editor = useEditor();

  if (!canvas || editor.technical.type !== "Canvas") return null;

  const behavior = editor.technical.behavior.get() || [];
  const currentWidth = (getBehaviorWidth(behavior) as DisplayWidth) || 12;

  const setWidth = (w: DisplayWidth) => {
    const next = behavior.filter((b) => !b.startsWith("w-") && !b.startsWith("h-"));
    const existingH = behavior.find((b) => b.startsWith("h-"));
    next.push(`w-${w}`);
    if (!existingH) next.push("h-4");
    editor.technical.behavior.set(next);
  };

  const fitSuggestion =
    manifest?.items && canvas ? computeFitWidth(canvas.id, manifest.items as Array<{ id: string }>, vault) : null;

  return (
    <Sidebar>
      <SidebarContent className="bg-white px-6 pt-5 pb-20">
        <div className="flex justify-center">
          <SimpleAdvancedToggle value={mode} onChange={setMode} />
        </div>

        <div className="mt-8 flex flex-col gap-7">
          {/* Text content */}
          <ResourceEditingProvider resource={canvas}>
            {mode === "simple" ? (
              <SimpleField>
                <SimpleFieldLabel>Title</SimpleFieldLabel>
                <div className="mt-2">
                  <LanguageMapEditor dispatchType="label" disableMultiline disallowHTML />
                </div>
              </SimpleField>
            ) : (
              <SimpleField>
                <SimpleFieldLabel>Label &amp; summary</SimpleFieldLabel>
                <div className="mt-2 flex flex-col gap-3">
                  <LanguageMapEditor dispatchType="label" disableMultiline disallowHTML />
                  <LanguageMapEditor dispatchType="summary" />
                </div>
              </SimpleField>
            )}
          </ResourceEditingProvider>

          {/* Width */}
          {mode === "simple" ? (
            <>
              <SimpleField>
                <SimpleFieldLabel>Width</SimpleFieldLabel>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {textualWidthOptions.map((option) => (
                    <SimpleOptionButton
                      key={option.value}
                      selected={currentWidth === option.value}
                      onClick={() => setWidth(option.value)}
                    >
                      {option.label}
                    </SimpleOptionButton>
                  ))}
                </div>
              </SimpleField>

              {fitSuggestion ? (
                <SimpleField>
                  <SimpleFieldLabel>Fit alongside {fitSuggestion.neighbour} slide</SimpleFieldLabel>
                  <div className="mt-3">
                    <SimpleOptionButton
                      selected={currentWidth === fitSuggestion.width}
                      onClick={() => setWidth(fitSuggestion.width as DisplayWidth)}
                    >
                      w-{fitSuggestion.width} — fills remaining space
                    </SimpleOptionButton>
                  </div>
                </SimpleField>
              ) : null}

              <div className="text-center text-xs" style={{ color: simpleLayoutColours.muted }}>
                w-{currentWidth}
              </div>
            </>
          ) : (
            <>
              <div className="px-2">
                <InputContainer $wide>
                  <DimensionsTriplet
                    widthId={editor.technical.width.containerId()}
                    width={editor.technical.width.get() || 0}
                    changeWidth={(v) => editor.technical.width.set(v)}
                    heightId={editor.technical.height.containerId()}
                    height={editor.technical.height.get() || 0}
                    changeHeight={(v) => editor.technical.height.set(v)}
                  />
                </InputContainer>
              </div>
              <BehaviorEditor
                behavior={behavior}
                onChange={(v) => editor.technical.behavior.set(v)}
                configs={[
                  {
                    id: "size",
                    component: (existing, setBehaviors) => (
                      <EditSize behaviors={existing} setBehaviors={setBehaviors} />
                    ),
                    label: { en: ["Size"] },
                    type: "custom",
                    initialOpen: true,
                    supports: (b) => b.startsWith("w-") || b.startsWith("h-"),
                  },
                ]}
              />
            </>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
