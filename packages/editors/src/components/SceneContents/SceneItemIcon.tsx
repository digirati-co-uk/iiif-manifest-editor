import { SceneIcon, type SceneIconName } from "@manifest-editor/components";

export function SceneItemIcon({ type, ...props }: { type: string } & React.SVGProps<SVGSVGElement>) {
  let name: SceneIconName = "other";
  if (type === "Model") name = "model";
  else if (type.endsWith("Camera")) name = "camera";
  else if (type.endsWith("Light")) name = "light";
  else if (type.endsWith("Audio") || type === "Audio" || type === "Sound") name = "audio";
  return <SceneIcon {...props} name={name} />;
}
