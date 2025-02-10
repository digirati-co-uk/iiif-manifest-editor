import type { ReactNode } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function CreatorGrid(props: {
  label: string;
  items: CreatorGridItemProps[];
}) {
  return (
    <ListBox
      orientation="horizontal"
      aria-label={props.label}
      selectionMode="single"
      items={props.items}
      className="grid grid-sm gap-4 p-4 mb-8"
    >
      {(item) => <CreatorGridItem {...item} />}
    </ListBox>
  );
}

export interface CreatorGridItemProps {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function CreatorGridItem(props: CreatorGridItemProps) {
  return (
    <ListBoxItem
      id={props.id}
      onAction={props.onClick}
      className={($s) =>
        twMerge(
          "bg-white p-2 border-me-gray-300 rounded-md border hover:border-me-primary-500",
          $s.isFocused &&
            "border-me-primary-500 outline-me-primary-500 outline-2",
        )
      }
    >
      <div className="rounded bg-me-gray-300 mb-2 flex items-center justify-center py-1 aspect-square">
        <div className="text-center [&>svg]:w-16 [&>svg]:h-16">
          {props.icon}
        </div>
      </div>
      <div className="text-center font-semibold text-sm">{props.title}</div>
      <div className="text-sm text-center text-black/50">
        {props.description}
      </div>
    </ListBoxItem>
  );
}
