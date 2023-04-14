import { forwardRef, ReactNode } from "react";
import { FlexContainer } from "@/components/layout/FlexContainer";
import { HandleContainer } from "./ReorderListItem.styles";
import { ResizeHandleIcon } from "@/icons/ResizeHandleIcon";
import { MoreMenu } from "@/icons/MoreMenu";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface ReorderListItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  as?: any;
  id: string;
  children: ReactNode;
  reorderEnabled?: boolean;

  inlineHandle?: boolean;

  // New?
  actions?: Array<{
    icon?: any;
    label: string;
    onClick: () => void;
  }>;
}
export function ReorderListItem({
  children,
  id,
  as,
  reorderEnabled,
  inlineHandle,
  actions,
  ...props
}: ReorderListItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Component = as || "div";

  if (!reorderEnabled) {
    return <Component {...props}>{children}</Component>;
  }

  return (
    <Component {...props} ref={setNodeRef} style={style} {...attributes} {...(inlineHandle ? listeners : {})}>
      <FlexContainer>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {actions?.length ? (
          <HandleContainer>
            <MoreMenu />
          </HandleContainer>
        ) : null}
        {inlineHandle ? null : (
          <HandleContainer ref={setActivatorNodeRef} {...listeners}>
            <ResizeHandleIcon />
          </HandleContainer>
        )}
      </FlexContainer>
    </Component>
  );
}
