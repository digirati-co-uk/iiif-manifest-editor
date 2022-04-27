import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { LanguageFieldEditor } from "../LanguageFieldEditor";

export const LanguageMapInputCanvas: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages: Array<string>;
  guidanceReference?: string;
}> = ({ dispatchType, languages, guidanceReference }) => {
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();
  const changeHandler = (data: any) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(
        canvas,
        dispatchType,
        data.toInternationalString()
      );
    }
  };

  return (
    <div key={canvas?.id}>
      {canvas && (
        <ErrorBoundary>
          <LanguageFieldEditor
            label={dispatchType}
            fields={canvas[dispatchType] || {}}
            onSave={(data: any) => changeHandler(data)}
            availableLanguages={languages}
            guidanceReference={guidanceReference}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
