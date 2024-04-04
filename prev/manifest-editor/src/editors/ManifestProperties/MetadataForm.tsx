import { useVault } from "react-iiif-vault";
import { useManifest } from "@/hooks/useManifest";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { MetadataEditor } from "../MetadataEditor";
import { EmptyProperty } from "@/atoms/EmptyProperty";
import { useConfig } from "@/shell";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export const MetadataForm: React.FC<{}> = () => {
  const { defaultLanguages } = useConfig();
  const manifest = useManifest();
  const vault = useVault();

  const dispatchType = "metadata";
  const changeHandler = (data: any, index?: number, property?: "label" | "value") => {
    const newMetaData = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];
    if (manifest && (index || index === 0) && property) {
      newMetaData[index][property] = data.toInternationalString();

      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const removeItem = (index: number) => {
    const newMetaData = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];

    if (manifest && (index || index === 0)) {
      newMetaData.splice(index, 1);

      vault.modifyEntityField(manifest, dispatchType, newMetaData);
    }
  };

  const addNew = () => {
    const withNew = manifest ? [...manifest[dispatchType]] : [];
    withNew.push({ label: {}, value: {} });
    if (manifest) {
      vault.modifyEntityField(manifest, dispatchType, withNew);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#metadata";

  return (
    <PaddedSidebarContainer>
      <EmptyProperty label={"metadata"} createNew={addNew} guidanceReference={guidanceReference} />
      <div key={manifest?.id}>
        {manifest && (
          <ErrorBoundary>
            <MetadataEditor
              fields={manifest[dispatchType]}
              onSave={(data: any, index?: number, property?: "label" | "value") => changeHandler(data, index, property)}
              availableLanguages={defaultLanguages}
              removeItem={removeItem}
              reorder={reorder}
            />
          </ErrorBoundary>
        )}
      </div>
    </PaddedSidebarContainer>
  );
};
