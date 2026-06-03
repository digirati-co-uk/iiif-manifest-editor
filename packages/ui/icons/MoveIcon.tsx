import * as React from 'react';
import { SVGProps } from 'react';
const MoveIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
    <g fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4}>
      <path d="m20 8 4-4m0 0 4 4m-4-4v12M20 40l4 4m0 0 4-4m-4 4V32M40 20l4 4m0 0-4 4m4-4H32M8 20l-4 4m0 0 4 4m-4-4h12" />
      <circle cx={24} cy={24} r={2} />
    </g>
  </svg>
);
export default MoveIcon;
