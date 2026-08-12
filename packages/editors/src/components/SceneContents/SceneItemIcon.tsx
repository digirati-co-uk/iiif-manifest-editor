import { AudioIcon } from "@manifest-editor/components";
import LightIcon from "@manifest-editor/ui/icons/LightIcon";

function Model3DIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5 4 7v10l8 4.5 8-4.5V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M4 7l8 4.5L20 7M12 11.5V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SceneCameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 8h3.2L8.7 6h6.6L16.8 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.2" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function OtherSceneItemIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

export function SceneItemIcon({ type, ...props }: { type: string } & React.SVGProps<SVGSVGElement>) {
  if (type === "Model") return <Model3DIcon {...props} />;
  if (type.endsWith("Camera")) return <SceneCameraIcon {...props} />;
  if (type.endsWith("Light")) return <LightIcon {...props} />;
  if (type.endsWith("Audio") || type === "Audio" || type === "Sound") return <AudioIcon {...props} />;
  return <OtherSceneItemIcon {...props} />;
}
