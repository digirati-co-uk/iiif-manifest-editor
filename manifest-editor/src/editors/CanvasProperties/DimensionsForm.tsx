import { useContext } from "react";

import { useCanvas, useVault } from "react-iiif-vault";
import { useShell } from "../../context/ShellContext/ShellContext";
import { DimensionsTriplet } from "../../atoms/DimensionsTriplet";

export const DimensionsForm: React.FC<{}> = () => {
  const shellContext = useShell();
  const canvas = useCanvas();
  const vault = useVault();

  const changeHeight = (data: number) => {
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "height", data);
    }
  };

  const changeWidth = (data: number) => {
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "width", data);
    }
  };

  const changeDuration = (data: number) => {
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "duration", data);
    }
  };

  return (
    <DimensionsTriplet
      width={canvas && canvas.width ? canvas.width : 0}
      changeWidth={changeWidth}
      height={canvas && canvas.height ? canvas.height : 0}
      changeHeight={changeHeight}
      duration={canvas && canvas.duration ? canvas.duration : 0}
      changeDuration={changeDuration}
    />
  );
};
