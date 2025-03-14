import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ItemWithHandle, MoreMenu } from "@manifest-editor/components";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { type ReactNode, useMemo } from "react";
import { AppDropdown, type AppDropdownItem } from "../AppDropdown/AppDropdown";
import { HandleContainer } from "./ReorderListItem.styles";

interface ReorderListItemProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  as?: any;
  item: { id: string; type?: string };
  children: ReactNode;
  reorderEnabled?: boolean;

  inlineHandle?: boolean;

  // New?
  actions?: AppDropdownItem[];
  marginBottom?: string | number;
  grid?: boolean;
}

export function ReorderListItem({
  children,
  as,
  item,
  reorderEnabled,
  inlineHandle,
  actions,
  marginBottom,
  grid,
  ...props
}: ReorderListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
    data: { ref: item },
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = useMemo(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      position: "relative",
    };
  }, [transform, transition]);

  const Component = as || "div";

  if (!reorderEnabled) {
    return <Component {...props}>{children}</Component>;
  }

  return (
    <Component
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(inlineHandle ? listeners : {})}
    >
      <ItemWithHandle
        grid={grid}
        actions={
          actions?.length ? (
            <AppDropdown as={HandleContainer} items={actions}>
              <MoreMenu />
            </AppDropdown>
          ) : null
        }
        handle={
          inlineHandle ? null : (
            <HandleContainer ref={setActivatorNodeRef} {...listeners}>
              <ResizeHandleIcon />
            </HandleContainer>
          )
        }
      >
        {children}
      </ItemWithHandle>
    </Component>
  );
}
