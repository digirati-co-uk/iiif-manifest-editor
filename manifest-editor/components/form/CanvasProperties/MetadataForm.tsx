import { useContext } from "react";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";

import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { InformationLink } from "../../atoms/InformationLink";
import { CalltoButton } from "../../atoms/Button";

export const MetadataForm: React.FC<{}> = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (
    data: any,
    index?: number,
    property?: "label" | "value"
  ) => {
    const newMetaData =
      canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];
    if (canvas && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData =
      canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];

    if (canvas && (index || index === 0)) {
      newMetaData.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = canvas ? [...canvas[dispatchType]] : [];
    withNew.push({ label: {}, value: {} });
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, withNew);
    }
  };
  const languages = editorContext?.languages || ["en", "none"];
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <>
      <div key={canvas?.id}>
        {canvas && (
          <ErrorBoundary>
            <MetadataEditor
              // @ts-ignore
              key={canvas.metadata}
              fields={canvas[dispatchType]}
              onSave={(
                data: any,
                index?: number,
                property?: "label" | "value"
              ) => changeHandler(data, index, property)}
              availableLanguages={languages}
              removeItem={removeItem}
            />
          </ErrorBoundary>
        )}
      </div>
      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
      <CalltoButton onClick={() => addNew()}>
        Add new metadata property
      </CalltoButton>
    </>
  );
};
