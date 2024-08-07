export function AddIcon({
  className,
  inline,
  height = 16,
  color = "black",
}: {
  inline?: boolean;
  height?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={`${height}px`}
      viewBox="0 0 24 24"
      width="24px"
      fill={color}
      style={{ verticalAlign: inline ? "bottom" : undefined }}
      className={className}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
    </svg>
  );
}
