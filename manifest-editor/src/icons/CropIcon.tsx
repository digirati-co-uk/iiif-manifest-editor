import React, { SVGProps } from "react";

export const CropIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" height="1em" width="1em" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M674.5 1017.91V861.5h-389q-37.783 0-64.391-26.609Q194.5 808.283 194.5 770.5v-389H38.087v-91H194.5V134.087h91V770.5h636.413v91H765.5v156.41h-91Zm0-327.41v-309h-309v-91h309q37.783 0 64.391 26.609Q765.5 343.717 765.5 381.5v309h-91Z" />
    {title ? <title>{title}</title> : null}
  </svg>
);
