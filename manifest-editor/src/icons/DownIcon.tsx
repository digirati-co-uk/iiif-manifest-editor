export const DownIcon: React.FC<{
  rotate?: number;
}> = ({ rotate = 0 }) => (
  <svg
    version="1.2"
    xmlns="http://www.w3.org/2000/svg"
    overflow="visible"
    preserveAspectRatio="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    style={{
      fill: "rgba(0, 0, 0, 0.6)",
      transform: `rotate(${rotate}deg)`,
    }}
  >
    <g>
      <path d="M7 10l5 5 5-5z" vectorEffect="non-scaling-stroke" />
    </g>
  </svg>
);
