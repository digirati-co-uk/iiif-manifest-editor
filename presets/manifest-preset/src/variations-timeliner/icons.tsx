import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const filled = { fill: "currentColor", stroke: "none" } as const;

export const PlayIcon = () => (
  <Icon {...filled}>
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </Icon>
);
export const PauseIcon = () => (
  <Icon {...filled}>
    <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
    <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
  </Icon>
);
export const PreviousIcon = () => (
  <Icon>
    <path d="M6 5v14" />
    <path d="M19 5.5v13a.8.8 0 0 1-1.25.66l-9-6.5a.8.8 0 0 1 0-1.32l9-6.5A.8.8 0 0 1 19 5.5Z" fill="currentColor" />
  </Icon>
);
export const NextIcon = () => (
  <Icon>
    <path d="M18 5v14" />
    <path d="M5 5.5v13a.8.8 0 0 0 1.25.66l9-6.5a.8.8 0 0 0 0-1.32l-9-6.5A.8.8 0 0 0 5 5.5Z" fill="currentColor" />
  </Icon>
);
export const SeekBackIcon = () => (
  <Icon>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <text x="12" y="15.5" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">
      5
    </text>
  </Icon>
);
export const SeekForwardIcon = () => (
  <Icon>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
    <text x="12" y="15.5" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">
      5
    </text>
  </Icon>
);
export const VolumeIcon = () => (
  <Icon>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </Icon>
);
export const MuteIcon = () => (
  <Icon>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
    <path d="m16 9 5 6" />
    <path d="m21 9-5 6" />
  </Icon>
);
export const LoopIcon = () => (
  <Icon>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </Icon>
);
export const MarkerIcon = () => (
  <Icon>
    <path d="M5 21V4" />
    <path d="M5 4h12l-2.5 4.5L17 13H5" />
  </Icon>
);
export const SplitIcon = () => (
  <Icon>
    <path d="M12 3v4M12 10v4M12 17v4" />
    <path d="m7 9-3 3 3 3" />
    <path d="m17 9 3 3-3 3" />
  </Icon>
);
export const GroupIcon = () => (
  <Icon>
    <rect x="3" y="8" width="7" height="8" rx="2" />
    <rect x="14" y="8" width="7" height="8" rx="2" />
    <path d="M10 12h4" />
    <path d="M3 4h18" />
  </Icon>
);
export const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </Icon>
);
export const ZoomInIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
    <path d="M11 8v6M8 11h6" />
  </Icon>
);
export const ZoomOutIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
    <path d="M8 11h6" />
  </Icon>
);
export const FitIcon = () => (
  <Icon>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
);
export const InfoIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <path d="M12 7.5h.01" strokeWidth={2.6} />
  </Icon>
);
export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
