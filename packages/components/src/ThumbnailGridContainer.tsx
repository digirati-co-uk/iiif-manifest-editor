export function ThumbnailGridContainer(props: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 p-4">{props.children}</div>;
}
