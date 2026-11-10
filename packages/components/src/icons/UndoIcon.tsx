import type { SVGProps } from "react";

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Boxicons by Boxicons - https://github.com/box-icons/boxicons-core/blob/main/LICENSE */}
      <path
        fill="currentColor"
        d="M9 10h6c2.21 0 4 1.79 4 4s-1.79 4-4 4h-3v2h3c3.31 0 6-2.69 6-6s-2.69-6-6-6H9V4L3 9l6 5z"
      />
    </svg>
  );
}
