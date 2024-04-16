import { SVGProps } from "react";

export const PauseIcon = (props: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
    {props.title ? <title>{props.title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);
