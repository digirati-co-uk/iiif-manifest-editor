import { Reference } from "@iiif/presentation-3";
import { useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { Input, InputLabel } from "../../../editors/Input";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";

type Target = {
  canvasID: string;
  annotationID: string;
};

export const CanvasTargetEditor: React.FC<Target> = ({ canvasID, annotationID }) => {
  console.log(canvasID);
  const [target, setTarget] = useState<string[]>(canvasID.split("#xywh=")[1].split(","));
  const canvas = canvasID.split("#xywh=")[0];

  const vault = useVault();

  useEffect(() => {
    const newValue = canvas + "#xywh=" + target.join(",");
    const annotation = vault.get(annotationID) as any;
    vault.modifyEntityField(annotation, "target", newValue);
  }, [canvasID, target]);

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

export function AnnotationTarget({ canvasID, annotationID }: Target) {
  // We want to offer the UI to not make the whole canvas?
  const isWhole = !canvasID.includes("#xywh=");
  return <div>{isWhole ? "Whole Canvas" : <CanvasTargetEditor canvasID={canvasID} annotationID={annotationID} />}</div>;
}
