import { useContext } from "react";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";

import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import { useShell } from "../../context/ShellContext/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { InformationLink } from "../../atoms/InformationLink";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { EmptyProperty } from "../../atoms/EmptyProperty";

export const MetadataForm: React.FC<{}> = () => {
  const editorContext = useManifestEditor();
  const shellContext = useShell();
  const manifest = useManifest();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (data: any, index?: number, property?: "label" | "value") => {
    const newMetaData = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];
    if (manifest && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];

    if (manifest && (index || index === 0)) {
      newMetaData.splice(index, 1);
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = manifest ? [...manifest[dispatchType]] : [];
    withNew.push({ label: {}, value: {} });
    if (manifest) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, withNew);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };
  const languages = editorContext?.languages || ["en", "none"];
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <>
      <EmptyProperty label={"metadata"} createNew={addNew} guidanceReference={guidanceReference} />
      <div key={manifest?.id}>
        {manifest && (
          <ErrorBoundary>
            <MetadataEditor
              // @ts-ignore
              key={manifest.metadata}
              fields={manifest[dispatchType]}
              onSave={(data: any, index?: number, property?: "label" | "value") => changeHandler(data, index, property)}
              availableLanguages={languages}
              removeItem={removeItem}
              reorder={reorder}
            />
          </ErrorBoundary>
        )}
      </div>
      <FlexContainer style={{ justifyContent: "center" }}>
        <CalltoButton aria-label="add new metadata pair" onClick={() => addNew()}>
          + Add new metadata pair
        </CalltoButton>
      </FlexContainer>
    </>
  );
};
