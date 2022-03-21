import { useContext } from "react";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";

import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { InformationLink } from "../../atoms/InformationLink";
import { CalltoButton } from "../../atoms/Button";

export const MetadataForm: React.FC<{}> = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (
    data: any,
    index?: number,
    property?: "label" | "value"
  ) => {
    const newMetaData =
      manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];
    if (manifest && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData =
      manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];

    if (manifest && (index || index === 0)) {
      newMetaData.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = manifest ? [...manifest[dispatchType]] : [];
    withNew.push({ label: {}, value: {} });
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, withNew);
    }
  };
  const languages = editorContext?.languages || ["en", "none"];
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <>
      <div key={manifest?.id}>
        {manifest && (
          <ErrorBoundary>
            <MetadataEditor
              // @ts-ignore
              key={manifest.metadata}
              fields={manifest[dispatchType]}
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
