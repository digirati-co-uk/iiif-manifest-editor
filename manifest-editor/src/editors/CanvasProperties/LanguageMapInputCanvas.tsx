import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";

export const LanguageMapInputCanvas: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages?: Array<string>;
  guidanceReference?: string;
}> = ({ dispatchType, languages, guidanceReference }) => {
  const canvas = useCanvas();
  const vault = useVault();
  const { defaultLanguages } = useConfig();
  const changeHandler = (data: any) => {
    if (canvas) {
      vault.modifyEntityField(canvas, dispatchType, data.toInternationalString());
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
            availableLanguages={languages || defaultLanguages}
            guidanceReference={guidanceReference}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
