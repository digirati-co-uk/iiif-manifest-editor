import * as React from "react";

export function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" stroke="#fff" {...props}>
      <g transform="translate(2 2)" strokeWidth={5} fill="none" fillRule="evenodd">
        <circle strokeOpacity={0.5} cx={18} cy={18} r={18} />
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
}
