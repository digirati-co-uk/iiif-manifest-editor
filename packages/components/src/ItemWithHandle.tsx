export function ItemWithHandle({
  children,
  handle,
  actions,
  grid,
}: {
  grid?: boolean;
  children: React.ReactNode;
  handle: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const gridStyleClassName = grid
    ? // Tailwind
      "absolute flex p-1 gap-1 bg-white z-1 right-1 top-1 rounded"
    : "flex-shrink-0 flex items-center gap-1 px-1";

  return (
    <div className={grid ? "relative flex flex-col" : "flex items-center"}>
      <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
      <div className={gridStyleClassName}>
        {actions}
        {handle}
      </div>
    </div>
  );
}
