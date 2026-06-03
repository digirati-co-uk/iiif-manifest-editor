import * as React from "react";
import { type SVGProps } from "react";

const PresetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.5 1a2.5 2.5 0 0 0-2.45 2H0v1h2.05a2.5 2.5 0 0 0 4.9 0H15V3H6.95A2.5 2.5 0 0 0 4.5 1m6 8a2.5 2.5 0 0 0-2.45 2H0v1h8.05a2.5 2.5 0 0 0 4.9 0H15v-1h-2.05a2.5 2.5 0 0 0-2.45-2"
    />
  </svg>
);

export default PresetIcon;
