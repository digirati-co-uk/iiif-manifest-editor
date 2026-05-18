import * as React from "react";
import type { SVGProps } from "react";

const DarkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m15 8-3-3 3-3 3 3zm5 3-2-2 2-2 2 2zm-7.925 11q-2.1 0-3.937-.8t-3.2-2.162-2.163-3.2-.8-3.938q0-3.65 2.325-6.437T10.225 2q-.45 2.475.275 4.838t2.5 4.137 4.138 2.5 4.837.275q-.65 3.6-3.45 5.925T12.075 22"
    />
  </svg>
);
export default DarkIcon;
