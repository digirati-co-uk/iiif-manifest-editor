import type { SVGProps } from "react";

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10 8 6 4-6 4z" fill="currentColor" />
    </svg>
  );
}
