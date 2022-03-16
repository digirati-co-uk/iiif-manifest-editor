import { useContext, useEffect } from "react";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import ShellContext from "../apps/Shell/ShellContext";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { LanguageFieldEditor } from "./LanguageFieldEditor";

type TempInput = {
  parentIndex: number;
  index: number;
  value: string;
  previousValue: string;
};

export const LanguageMapInput: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages: Array<string>;
}> = ({ dispatchType, languages }) => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();
  const changeHandler = (data: any) => {
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(
        manifest,
        dispatchType,
        data.toInternationalString()
      );
    }
  };

  return (
    <>
      {manifest && (
        <ErrorBoundary>
          <LanguageFieldEditor
            label={dispatchType}
            fields={manifest[dispatchType] || {}}
            onSave={(data: any) => changeHandler(data)}
            availableLanguages={languages}
          />
        </ErrorBoundary>
      )}
    </>
  );
};
