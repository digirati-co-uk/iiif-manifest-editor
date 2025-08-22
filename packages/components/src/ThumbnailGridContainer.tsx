import { twMerge } from "tailwind-merge";

export function ThumbnailGridContainer(props: {
  size?: 'grid-sm' | 'grid-md' | 'grid-lg',
  children: React.ReactNode; wide?: boolean }) {
  if (props.wide) {
    return <div className={twMerge('grid', props.size || "grid-md", 'gap-4 p-4 overflow-y-auto')}>{props.children}</div>;
  }
  return <div className="grid grid-cols-2 gap-4 p-4">{props.children}</div>;
}
