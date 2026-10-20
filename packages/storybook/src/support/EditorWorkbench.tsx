import { Modal } from "@manifest-editor/components";
import { CanvasPanelViewer } from "@manifest-editor/editors";
import {
  ModularPanel,
  ResourceEditingProvider,
  useEditingResource,
  useLayoutProvider,
  type Config,
  type MappedApp,
} from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasContext, useVault, useVaultSelector } from "react-iiif-vault";
import { selectEditorTarget, type EditorSelection, type EditorTarget } from "../stories/editors/editor-targets";
import { HeadlessEditor, type LoadedResource } from "./HeadlessEditor";
import { JsonPanel, StoryFrame } from "./StoryFrame";

export interface EditorWorkbenchProps {
  title: string;
  summary: string;
  resource: string;
  target?: EditorTarget;
  selectedTab: string;
  config?: Partial<Config>;
  app?: MappedApp;
  showViewer?: boolean;
}

function EditingPanel({
  selection,
  selectedTab,
  showViewer,
}: {
  selection: EditorSelection;
  selectedTab: string;
  showViewer?: boolean;
}) {
  const { reference, context, jsonReference } = selection;
  const layout = useLayoutProvider();
  const { actions, state } = layout;
  const editing = useEditingResource();
  const vault = useVault();
  const vaultState = useVaultSelector((state) => state.iiif);
  const active = editing?.resource.source || reference;
  const json = useMemo(() => {
    // Serialization must run again when the subscribed Vault state changes.
    void vaultState;
    return vault.toPresentation3(jsonReference || active);
  }, [vault, vaultState, active, jsonReference]);

  const openEditor = useCallback(() => {
    if (showViewer && selection.canvasId && reference.type !== "Canvas") {
      actions.edit({ id: selection.canvasId, type: "Canvas" }, undefined, { reset: true });
    }
    actions.edit(reference, context, { reset: !showViewer, selectedTab, forceOpen: true });
  }, [actions, reference, context, selectedTab, showViewer, selection.canvasId]);

  useEffect(() => openEditor(), [openEditor]);

  const editor = layout.rightPanels.find((panel) => panel.id === state.rightPanel.current);
  const modal = layout.modals?.find((panel) => panel.id === state.modal.current);

  return (
    <ResourceEditingProvider resource={active}>
      <div className="sb-split">
        <section
          className="sb-pane sb-editor"
          aria-label="Resource editor"
          style={showViewer ? { flexDirection: "column" } : undefined}
        >
          {showViewer && selection.canvasId && (
            <div style={{ display: "flex", flex: "0 0 40%", minHeight: 220 }}>
              <CanvasPanelViewer onEditAnnotation={(id) => actions.edit({ id, type: "Annotation" })} />
            </div>
          )}
          <div style={{ display: "flex", flex: 1, minHeight: 0, width: "100%" }}>
            {editing && state.rightPanel.open ? (
              <ModularPanel
                panel={editor}
                state={state.rightPanel}
                actions={actions.rightPanel}
                style={{ width: "100%" }}
              />
            ) : (
              <button className="sb-button" onClick={openEditor}>
                Open editor
              </button>
            )}
          </div>
        </section>
        <JsonPanel title="Live resource JSON" value={json} />
      </div>
      {modal && (
        <Modal title={modal.label} open={state.modal.open} onClose={() => actions.modal.close()}>
          <div style={{ minHeight: 360, maxHeight: "65vh", overflow: "auto" }}>
            <ModularPanel panel={modal} state={state.modal} actions={actions.modal} isModal noHeader />
          </div>
        </Modal>
      )}
    </ResourceEditingProvider>
  );
}

function LoadedEditor({
  loaded,
  target,
  selectedTab,
  showViewer,
}: {
  loaded: LoadedResource;
  target: EditorWorkbenchProps["target"];
  selectedTab: string;
  showViewer?: boolean;
}) {
  const [selection, setSelection] = useState<EditorSelection>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    selectEditorTarget(loaded, target || "manifest").then(
      (selection) => {
        if (!cancelled) setSelection(selection);
      },
      (error) => {
        if (!cancelled) setError(String(error.message || error));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [loaded, target]);
  if (error) return <p role="alert">{error} Choose another source or use Reset to retry.</p>;
  if (!selection) return <output className="sb-status">Preparing editor resource…</output>;
  const panel = <EditingPanel selection={selection} selectedTab={selectedTab} showViewer={showViewer} />;
  return selection.canvasId ? <CanvasContext canvas={selection.canvasId}>{panel}</CanvasContext> : panel;
}

export function EditorWorkbench({
  title,
  summary,
  resource,
  target = "manifest",
  selectedTab,
  config,
  app,
  showViewer,
}: EditorWorkbenchProps) {
  const [revision, reset] = useState(0);
  return (
    <StoryFrame title={title} summary={summary} source={resource} onReset={() => reset((value) => value + 1)}>
      <HeadlessEditor
        key={`${resource}-${target}-${selectedTab}-${JSON.stringify(config)}-${revision}`}
        resource={resource}
        config={config}
        app={app}
      >
        {(loaded) => <LoadedEditor loaded={loaded} target={target} selectedTab={selectedTab} showViewer={showViewer} />}
      </HeadlessEditor>
    </StoryFrame>
  );
}
