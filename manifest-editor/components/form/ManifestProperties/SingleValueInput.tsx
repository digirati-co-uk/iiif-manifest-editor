import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../../hooks/useManifest";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { StringSelector } from "../StringSelector";

export const SingleValueInput: React.FC<{
  // Add to this list as we go
  dispatchType: "rights" | "viewingDirection" | "behavior";
}> = ({ dispatchType }) => {
  const shellContext = useContext(ShellContext);
  const manifestEditorContext = useContext(ManifestEditorContext);
  const manifest = useManifest();
  const vault = useVault();

  const changeHandler = (data: any) => {
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, data);
    }
  };

  const [selected, setSelected] = useState(
    manifest && manifest[dispatchType] ? manifest[dispatchType] : []
  );

  // Handles multiselects
  const changeMulti = (value: string) => {
    let newValue: string[] = [];
    if (selected && Array.isArray(selected)) {
      const prev = [...selected];
      if (prev.includes(value)) {
        newValue = prev.filter((val: string) => val !== value);
      } else {
        prev.push(value);
        newValue = prev;
      }
    }
    setSelected(newValue);
  };

  return (
    <>
      {manifest && dispatchType === "rights" && (
        <ErrorBoundary>
          <StringSelector
            key={manifest.id}
            options={[
              "http://creativecommons.org/licenses/by/4.0/",
              "http://creativecommons.org/licenses/by-nc/4.0/",
            ]}
            label={"Rights"}
            selected={
              manifest && manifest[dispatchType] ? manifest[dispatchType] : []
            }
            multi={false}
            changeHandler={(e: any) => changeHandler(e)}
            guidanceReference={"https://iiif.io/api/presentation/3.0/#rights"}
          />
        </ErrorBoundary>
      )}
      {manifest && dispatchType === "viewingDirection" && (
        <ErrorBoundary>
          <StringSelector
            key={manifest.id}
            label="Viewing direction"
            options={[
              "left to right",
              "right to left",
              "top to bottom",
              "bottom to top",
            ]}
            selected={
              manifest && manifest[dispatchType] ? manifest[dispatchType] : []
            }
            multi={false}
            guidanceReference="https://iiif.io/api/presentation/3.0/#viewingdirection"
            changeHandler={(e: any) => changeHandler(e)}
          />
        </ErrorBoundary>
      )}
      {manifest && dispatchType === "behavior" && (
        <ErrorBoundary>
          <StringSelector
            key={manifest.id}
            label="Behavior"
            options={manifestEditorContext?.behaviorProperties || []}
            selected={selected}
            multi={true}
            guidanceReference="https://iiif.io/api/presentation/3.0/#behavior"
            changeHandler={(e: any) => changeMulti(e)}
          />
        </ErrorBoundary>
      )}
    </>
  );
};
