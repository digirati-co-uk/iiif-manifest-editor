import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";

export const MetadataForm: React.FC = () => {
  const { defaultLanguages } = useConfig();
  const canvas = useCanvas();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (data: any, index?: number, property?: "label" | "value") => {
    const newMetaData = canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];
    if (canvas && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();

      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData = canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];

    if (canvas && (index || index === 0)) {
      newMetaData.splice(index, 1);

      vault.modifyEntityField(canvas, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = canvas ? [...canvas[dispatchType]] : [];
    withNew.push({ label: { none: [""] }, value: { none: [""] } });
    if (canvas) {
      vault.modifyEntityField(canvas, dispatchType, withNew);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      vault.modifyEntityField(canvas, dispatchType, newOrder);
    }
  };
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <>
      <EmptyProperty label={"metadata"} createNew={addNew} guidanceReference={guidanceReference} />
      <div key={canvas?.id}>
        {canvas && (
          <ErrorBoundary>
            <MetadataEditor
              fields={canvas[dispatchType]}
              onSave={(data: any, index?: number, property?: "label" | "value") => changeHandler(data, index, property)}
              availableLanguages={defaultLanguages}
              removeItem={removeItem}
              reorder={reorder}
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
};
