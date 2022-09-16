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
      transition: "transform 0.2s",
    }}
  >
    <path d="M8.12 9.29 12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0z" />
  </svg>
);
