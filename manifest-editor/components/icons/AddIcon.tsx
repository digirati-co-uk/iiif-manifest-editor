export const AddIcon: React.FC<{
  inline?: boolean;
  height?: number;
  className?: string;
}> = ({ className, inline, height = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    viewBox="0 0 24 24"
    width="24px"
    fill="#000000"
    style={{ verticalAlign: inline ? "bottom" : undefined }}
    className={className}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
