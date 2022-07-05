import { useEffect, useState } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { CheckboxInput, Input, InputLabel } from "../../../editors/Input";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { Accordian } from "../Accordian/Accordian";

type Target = {
  canvasTarget: string;
  annotationID: string;
};

export const CanvasTargetEditor: React.FC<Target> = ({ canvasTarget, annotationID }) => {
  const [target, setTarget] = useState<string[]>(canvasTarget.split("#xywh=")[1].split(","));
  const canvas = canvasTarget.split("#xywh=")[0];

  const vault = useVault();

  useEffect(() => {
    const newValue = canvas + "#xywh=" + target.join(",");
    const annotation = vault.get(annotationID) as any;
    vault.modifyEntityField(annotation, "target", newValue);
  }, [canvasTarget, target]);

  const update = (position: number, value: string) => {
    const targetCopy = [...target];
    targetCopy[position] = value;
    setTarget(targetCopy);
  };

  return (
    <FlexContainerRow>
      <FlexContainerColumn>
        <InputLabel>x</InputLabel>
        <Input
          type={"number"}
          style={{ minWidth: "3rem", padding: "unset" }}
          value={target[0]}
          onChange={(e: any) => update(0, e.target.value)}
        />
      </FlexContainerColumn>
      <FlexContainerColumn>
        <InputLabel>y</InputLabel>
        <Input
          type={"number"}
          style={{ minWidth: "3rem", padding: "unset" }}
          value={target[1]}
          onChange={(e: any) => update(1, e.target.value)}
        />
      </FlexContainerColumn>
      <FlexContainerColumn>
        <InputLabel>width</InputLabel>
        <Input
          type={"number"}
          style={{ minWidth: "3rem", padding: "unset" }}
          value={target[2]}
          onChange={(e: any) => update(2, e.target.value)}
        />
      </FlexContainerColumn>
      <FlexContainerColumn>
        <InputLabel>height</InputLabel>
        <Input
          type={"number"}
          style={{ minWidth: "3rem", padding: "unset" }}
          value={target[3]}
          onChange={(e: any) => update(3, e.target.value)}
        />
      </FlexContainerColumn>
    </FlexContainerRow>
  );
};

export function AnnotationTarget({ canvasTarget, annotationID }: Target) {
  const [showEditor, setShowEditor] = useState(false);
  const canvas = useCanvas();
  const vault = useVault();

  const targetNotSpecified = !canvasTarget.includes("#xywh=");
  const isWhole =
    canvasTarget.includes("#xywh=") &&
    canvasTarget.split("#xywh=")[1] &&
    canvasTarget.split("#xywh=")[1] === `0,0,${canvas?.width},${canvas?.height}`;

  function changeToFullCanvas() {
    if (!canvas || !canvas.id) return;
    const annotation = vault.get(annotationID) as any;
    vault.modifyEntityField(annotation, "target", canvas.id);
    setShowEditor(!showEditor);
  }

  return (
    <Accordian renderOpen={true} title={"Target"}>
      <InputLabel $inline={true}>
        <CheckboxInput
          style={{ minWidth: "3rem", padding: "unset" }}
          defaultChecked={isWhole || targetNotSpecified}
          onChange={() => changeToFullCanvas()}
        />
        Target whole canvas
      </InputLabel>
      {!(isWhole || targetNotSpecified || showEditor) && (
        <CanvasTargetEditor canvasTarget={canvasTarget} annotationID={annotationID} />
      )}
      {showEditor && (
        <CanvasTargetEditor
          canvasTarget={canvasTarget + `#xywh=0,0,${canvas?.width},${canvas?.height}`}
          annotationID={annotationID}
        />
      )}
    </Accordian>
  );
}
