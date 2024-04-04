import React, { SVGProps } from "react";

export const TickIcon = (props: any) => (
  <svg
    width="24px"
    height="1rem"
    viewBox="0 0 24 12"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <g transform="translate(2, -4)">
      <polygon
        fill="#29A745"
        fillRule="nonzero"
        points="7.5 13.5 4 10 2.83333333 11.1666667 7.5 15.8333333 17.5 5.83333333 16.3333333 4.66666667"
      />
    </g>
  </svg>
);

export const WhiteTickIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1em" width="1em" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor" />
  </svg>
);
