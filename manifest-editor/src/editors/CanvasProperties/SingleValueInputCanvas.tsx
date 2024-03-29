import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useCanvas } from "react-iiif-vault";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { RightsForm } from "../RightsForm";
import { StringSelector } from "@/editors/StringSelector";
import { useConfig } from "@/shell";

export const SingleValueInput: React.FC<{
  // Add to this list as we go
  dispatchType: "rights" | "behavior";
}> = ({ dispatchType }) => {
  const { behaviorPresets } = useConfig();
  const canvas = useCanvas();
  const vault = useVault();
  const changeHandler = (data: any) => {
    if (canvas) {
      vault.modifyEntityField(canvas, dispatchType, data);
    }
  };

  const [selected, setSelected] = useState(canvas && canvas[dispatchType] ? canvas[dispatchType] : []);

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
      {canvas && dispatchType === "rights" && (
        <ErrorBoundary>
          <RightsForm
            key={canvas.id}
            options={["http://creativecommons.org/licenses/by/4.0/", "http://creativecommons.org/licenses/by-nc/4.0/"]}
            label={"rights"}
            selected={canvas && canvas[dispatchType] ? canvas[dispatchType] : []}
            changeHandler={(e: any) => changeHandler(e)}
            guidanceReference={"https://iiif.io/api/presentation/3.0/#rights"}
          />
        </ErrorBoundary>
      )}
      {canvas && dispatchType === "behavior" && (
        <ErrorBoundary>
          <StringSelector
            key={canvas.id}
            label="behavior"
            options={behaviorPresets}
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
