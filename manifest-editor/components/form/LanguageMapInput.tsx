import { useContext } from "react";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import ShellContext from "../apps/Shell/ShellContext";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { InformationLink } from "../atoms/InformationLink";
import { ShadowContainer } from "../atoms/ShadowContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";

export const LanguageMapInput: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary" | "requiredStatement";
  languages: Array<string>;
  guidanceReference?: string;
}> = ({ dispatchType, languages, guidanceReference }) => {
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
    <ShadowContainer>
      {manifest && (
        <ErrorBoundary>
          <LanguageFieldEditor
            label={dispatchType}
            // @ts-ignore
            fields={manifest[dispatchType] || {}}
            onSave={(data: any) => changeHandler(data)}
            availableLanguages={languages}
          />
        </ErrorBoundary>
      )}
      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
    </ShadowContainer>
  );
};
