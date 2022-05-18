import { useContext } from "react";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";

import { useCanvas, useVault } from "react-iiif-vault";
import { useShell } from "../../context/ShellContext/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { InformationLink } from "../../atoms/InformationLink";
import { CalltoButton } from "../../atoms/Button";
import { EmptyProperty } from "../../atoms/EmptyProperty";

export const MetadataForm: React.FC<{}> = () => {
  const editorContext = useManifestEditor();
  const shellContext = useShell();
  const canvas = useCanvas();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (data: any, index?: number, property?: "label" | "value") => {
    const newMetaData = canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];
    if (canvas && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData = canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];

    if (canvas && (index || index === 0)) {
      newMetaData.splice(index, 1);
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = canvas ? [...canvas[dispatchType]] : [];
    withNew.push({ label: {}, value: {} });
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, withNew);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newOrder);
    }
  };
  const languages = editorContext?.languages || ["en", "none"];
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <>
      <EmptyProperty label={"metadata"} createNew={addNew} guidanceReference={guidanceReference} />
      <div key={canvas?.id}>
        {canvas && (
          <ErrorBoundary>
            <MetadataEditor
              // @ts-ignore
              key={canvas.metadata}
              fields={canvas[dispatchType]}
              onSave={(data: any, index?: number, property?: "label" | "value") => changeHandler(data, index, property)}
              availableLanguages={languages}
              removeItem={removeItem}
              reorder={reorder}
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
};
