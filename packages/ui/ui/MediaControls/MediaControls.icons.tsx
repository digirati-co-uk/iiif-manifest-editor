import { SVGProps } from "react";

export const PlayIcon = (props: SVGProps<SVGSVGElement> & { title: string }) => (
  <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
    {props.title ? <title>{props.title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

export const PauseIcon = (props: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
    {props.title ? <title>{props.title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const VolumeUpIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" height="1em" width="1em" viewBox="2 2 20 20">
    {title ? <title>{title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="currentColor"
      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
    />
  </svg>
);

export const VolumeDownIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" height="1em" width="1em" viewBox="2 2 20 20">
    {title ? <title>{title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="currentColor"
      d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
    />
  </svg>
);

export const VolumeOffIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" height="1em" width="1em" viewBox="2 2 20 20">
    {title ? <title>{title}</title> : null}
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="currentColor"
      d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
    />
  </svg>
);
