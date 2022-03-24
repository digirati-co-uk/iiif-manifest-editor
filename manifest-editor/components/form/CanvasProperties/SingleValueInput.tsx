import { useContext, useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useCanvas } from "react-iiif-vault";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { StringSelector } from "../StringSelector";

export const SingleValueInput: React.FC<{
  // Add to this list as we go
  dispatchType: "rights" | "behavior";
}> = ({ dispatchType }) => {
  const shellContext = useContext(ShellContext);
  const manifestEditorContext = useContext(ManifestEditorContext);
  const canvas = useCanvas();
  const vault = useVault();
  const changeHandler = (data: any) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, data);
    }
  };

  const [selected, setSelected] = useState(
    canvas && canvas[dispatchType] ? canvas[dispatchType] : []
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

  useEffect(() => {
    changeHandler(selected);
  }, [selected]);

  return (
    <>
      <FlexContainerColumn style={{ overflow: "hidden" }}>
        {canvas && dispatchType === "rights" && (
          <ErrorBoundary>
            <StringSelector
              key={canvas.id}
              options={[
                "http://creativecommons.org/licenses/by/4.0/",
                "http://creativecommons.org/licenses/by-nc/4.0/",
              ]}
              label={"Rights"}
              selected={
                canvas && canvas[dispatchType] ? canvas[dispatchType] : []
              }
              changeHandler={(e: any) => changeHandler(e)}
              guidanceReference={"https://iiif.io/api/presentation/3.0/#rights"}
            />
          </ErrorBoundary>
        )}
      </FlexContainerColumn>
      <FlexContainerColumn>
        {canvas && dispatchType === "behavior" && (
          <ErrorBoundary>
            <StringSelector
              key={canvas.id}
              label="Behavior"
              options={manifestEditorContext?.behaviorProperties || []}
              selected={selected}
              multi={true}
              guidanceReference="https://iiif.io/api/presentation/3.0/#behavior"
              changeHandler={(e: any) => changeMulti(e)}
            />
          </ErrorBoundary>
        )}
      </FlexContainerColumn>
    </>
  );
};