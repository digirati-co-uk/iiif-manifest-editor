import type { SVGProps } from "react";

export function PreviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <title>Preview</title>
      <path d="M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7s-9.27-3.11-11-7c1.73-3.89 6-7 11-7Zm0 2c-3.72 0-7.04 2.01-8.74 5C4.96 14.99 8.28 17 12 17s7.04-2.01 8.74-5C19.04 9.01 15.72 7 12 7Zm0 2.5A2.5 2.5 0 1 1 12 14a2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}
