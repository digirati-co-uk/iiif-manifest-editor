import { ReactNode } from "react";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { HandleContainer } from "./ReorderListItem.styles";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { MoreMenu } from "@manifest-editor/ui/icons/MoreMenu";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { AppDropdown, AppDropdownItem } from "../AppDropdown/AppDropdown";

interface ReorderListItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  as?: any;
  item: { id: string; type?: string };
  children: ReactNode;
  reorderEnabled?: boolean;

  inlineHandle?: boolean;

  // New?
  actions?: AppDropdownItem[];
  marginBottom?: string | number;
}
export function ReorderListItem({
  children,
  as,
  item,
  reorderEnabled,
  inlineHandle,
  actions,
  marginBottom,
  ...props
}: ReorderListItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id: item.id,
    data: { ref: item },
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

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
      <FlexContainer style={{ alignItems: "center", marginBottom }}>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {actions?.length ? (
          <AppDropdown as={HandleContainer} items={actions}>
            <MoreMenu />
          </AppDropdown>
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
