import type { SVGProps } from "react";

export function ResizeHandleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <title>Rearrange</title>
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z" />
    </svg>
  );
}
