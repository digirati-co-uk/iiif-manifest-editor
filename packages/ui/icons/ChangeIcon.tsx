import * as React from "react";
import { SVGProps } from "react";

export function ChangeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1em" width="1em" {...props}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M12 7.77 18.39 18H5.61L12 7.77M12 4 2 20h20L12 4z" fill="currentColor" />
    </svg>
  );
}
