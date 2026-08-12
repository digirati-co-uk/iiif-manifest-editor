import type { ReactNode, SVGProps } from "react";

export type SceneIconName =
  | "annotations"
  | "audio"
  | "camera"
  | "camera-update"
  | "contents"
  | "frame"
  | "light"
  | "model"
  | "move"
  | "other"
  | "reset-view"
  | "rotate"
  | "scale"
  | "snap"
  | "workflow";

// Lucide icons (ISC), except camera-update from Tabler Icons (MIT).
// Source: https://icones.js.org/collection/all
const icons: Record<SceneIconName, ReactNode> = {
  annotations: (
    <>
      <path d="M12.7 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4.7" />
      <circle cx="19" cy="6" r="3" />
    </>
  ),
  audio: <path d="M2 10v3m4-7v11m4-14v18m4-13v7m4-10v13m4-8v3" />,
  camera: (
    <>
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
    </>
  ),
  "camera-update": (
    <>
      <path d="M11 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v4" />
      <path d="M9 13a3 3 0 1 0 6 0 3 3 0 0 0-6 0m6 6 2 2 4-4" />
    </>
  ),
  contents: (
    <>
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3zM7 16.5l-4.74-2.85M7 16.5l5-3m-5 3v5.17m5-8.17V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5zm5 3-5-3m5 3 4.74-2.85M17 16.5v5.17" />
      <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0zM12 8 7.26 5.15M12 8l4.74-2.85M12 13.5V8" />
    </>
  ),
  frame: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    </>
  ),
  light: (
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5m0 4h6m-5 4h4" />
  ),
  model: (
    <>
      <path d="M10 22v-8M2.336 8.89 10 14l11.715-7.029" />
      <path d="M22 14a2 2 0 0 1-.971 1.715l-10 6a2 2 0 0 1-2.138-.05l-6-4A2 2 0 0 1 2 16v-6a2 2 0 0 1 .971-1.715l10-6a2 2 0 0 1 2.138.05l6 4A2 2 0 0 1 22 8z" />
    </>
  ),
  move: (
    <>
      <path d="M5 3v16h16M5 19l6-6" />
      <path d="m2 6 3-3 3 3m10 10 3 3-3 3" />
    </>
  ),
  other: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  "reset-view": (
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  rotate: (
    <>
      <path d="m15.194 13.707 3.814 1.86-1.86 3.814m-.676-11.853A5 10 0 1 0 13 21.798" />
      <path d="M21.798 11A10 5 0 1 0 19 15.57" />
    </>
  ),
  scale: (
    <>
      <path d="M5 7v11a1 1 0 0 0 1 1h11m-11.707-.293L11 13" />
      <circle cx="19" cy="19" r="2" />
      <circle cx="5" cy="5" r="2" />
    </>
  ),
  snap: (
    <path d="m12 15 4 4M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282zM5 8l4 4" />
  ),
  workflow: (
    <>
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </>
  ),
};

export function SceneIcon({ name, ...props }: { name: SceneIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
