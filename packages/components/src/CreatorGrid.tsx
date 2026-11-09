import { FloatingPortal } from "@floating-ui/react";
import type { ReactNode } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { EmptyCanvasIcon } from "./icons/EmptyCanvasIcon";
import { useTooltip } from "./Tooltip";

export function CreatorGrid(props: { label: string; items: CreatorGridItemProps[]; compact?: boolean }) {
  return (
    <ListBox
      orientation="horizontal"
      aria-label={props.label}
      selectionMode="single"
      items={props.items}
      className={twMerge("grid grid-cols-2 gap-2 p-4 sm:grid-cols-3", props.compact && "flex flex-wrap pt-0")}
    >
      {(item) => <CreatorGridItem {...item} compact={props.compact} />}
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

function CreatorGridItem(props: CreatorGridItemProps & { compact?: boolean }) {
  const tooltip = useTooltip();
  const reference = tooltip.elements.reference;
  const modalRoot =
    reference && "closest" in reference ? reference.closest<HTMLElement>(".manifest-editor-modal") : undefined;
  return (
    <>
      <ListBoxItem
        {...tooltip.getReferenceProps()}
        ref={tooltip.refs.setReference}
        id={props.id}
        textValue={props.title}
        aria-label={props.title}
        aria-description={props.description}
        onAction={props.onClick}
        className={($s) =>
          twMerge(
            "flex cursor-pointer items-center gap-3 rounded-md border border-me-gray-300 bg-white p-3 text-me-gray-700 transition-colors hover:border-me-primary-500 hover:bg-me-primary-100 motion-reduce:transition-none",
            props.compact && "gap-2 px-3 py-2",
            $s.isFocused && "border-me-primary-500 outline outline-2 outline-me-primary-500"
          )
        }
      >
        <span
          aria-hidden="true"
          className={twMerge(
            "flex shrink-0 items-center justify-center [&>svg]:h-8 [&>svg]:w-8",
            props.compact && "[&>svg]:h-5 [&>svg]:w-5"
          )}
        >
          {props.icon || <EmptyCanvasIcon />}
        </span>
        <span className="text-sm font-medium">{props.title}</span>
      </ListBoxItem>
      {tooltip.open && props.description ? (
        <FloatingPortal root={modalRoot || undefined}>
          <div className="manifest-editor">
            <div
              ref={tooltip.refs.setFloating}
              {...tooltip.getFloatingProps()}
              style={tooltip.floatingStyles}
              className="pointer-events-none z-50 max-w-xs rounded bg-gray-900 px-3 py-2 text-sm text-white shadow"
            >
              {props.description}
            </div>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
