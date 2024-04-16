import { SVGProps } from "react";

export const PlayIcon = (props: SVGProps<SVGSVGElement> & { title: string }) => (
  <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
    {props.title ? <title>{props.title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);
