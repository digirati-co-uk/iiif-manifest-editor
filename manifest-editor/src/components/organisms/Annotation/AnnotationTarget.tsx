import { useEffect, useState } from "react";
import { Input, InputBorderless, InputLabel } from "../../../editors/Input";
import { FlexContainerRow } from "../../layout/FlexContainer";

type Target = {
  id: string;
  onChange: (newTarget: string) => void;
};

export const CanvasTargetEditor: React.FC<Target> = ({ id, onChange }) => {
  const [target, setTarget] = useState<string[]>(id.split("#xywh=")[1].split(","));
  const canvas = id.split("#xywh=");

  useEffect(() => {
    const newValue = canvas + "#xywh=" + target.join(",");
    onChange(newValue);
  }, [id, target]);

  const update = (position: number, value: string) => {
    const targetCopy = [...target];
    targetCopy[position] = value;
    setTarget(targetCopy);
  };

  return (
    <FlexContainerRow>
      <InputLabel>x</InputLabel>
      <Input
        style={{ minWidth: "3rem", padding: "unset" }}
        value={target[0]}
        onChange={(e: any) => update(0, e.target.value)}
      />
      <InputLabel>y</InputLabel>
      <Input
        style={{ minWidth: "3rem", padding: "unset" }}
        value={target[1]}
        onChange={(e: any) => update(1, e.target.value)}
      />
      <InputLabel>w</InputLabel>
      <Input
        style={{ minWidth: "3rem", padding: "unset" }}
        value={target[2]}
        onChange={(e: any) => update(2, e.target.value)}
      />
      <InputLabel>h</InputLabel>
      <Input
        style={{ minWidth: "3rem", padding: "unset" }}
        value={target[3]}
        onChange={(e: any) => update(3, e.target.value)}
      />
    </FlexContainerRow>
  );
};

export function AnnotationTarget({ id, onChange }: Target) {
  const isWhole = !id.includes("#xywh=");
  return (
    <>
      <div>{isWhole ? "Whole Canvas" : <CanvasTargetEditor id={id} onChange={onChange} />}</div>
    </>
  );
}
