import { forwardRef, type ReactNode } from "react";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { HandleContainer } from "./ReorderListItem.styles";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { MoreMenu } from "@manifest-editor/components";

interface ReorderListItemProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  as?: any;
  children: ReactNode;
  reorderEnabled?: boolean;
  handleProps?: any;
  inlineHandle?: boolean;

  // New?
  actions?: Array<{
    icon?: any;
    label: string;
    onClick: () => void;
  }>;
}

export const ReorderListItem = forwardRef<any, ReorderListItemProps>(
  (
    { handleProps, reorderEnabled, as, inlineHandle, children, ...props },
    ref,
  ) => {
    const Component = as || "div";

    if (!reorderEnabled) {
      return (
        <Component ref={ref} {...props}>
          {children}
        </Component>
      );
    }

    return (
      <Component ref={ref} {...props}>
        <FlexContainer {...(inlineHandle ? handleProps : {})}>
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
          <HandleContainer>
            <MoreMenu />
          </HandleContainer>
          {inlineHandle ? null : (
            <HandleContainer {...handleProps}>
              <ResizeHandleIcon />
            </HandleContainer>
          )}
        </FlexContainer>
      </Component>
    );
  },
);
