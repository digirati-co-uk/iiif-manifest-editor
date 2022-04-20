import { useContext } from "react";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";

import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { InformationLink } from "../../atoms/InformationLink";
import { CalltoButton } from "../../atoms/Button";

export const StructuralForm: React.FC<{}> = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();
  console.log(vault.get(canvas.annotations));

  const dispatchType = "annotations";
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
    withNew.push({ id: "SOMETHING", type: "SOMETHING" });
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, withNew);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newOrder);
    }
  };
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";

  return (
    <>
      <div key={canvas?.id}>
        {canvas && (
          <ErrorBoundary>
            <div>Editor in here</div>
          </ErrorBoundary>
        )}
      </div>
      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
      <CalltoButton
        onClick={() => addNew()}
        aria-label="new annotation property"
      >
        Add new annotation property
      </CalltoButton>
    </>
  );
};
