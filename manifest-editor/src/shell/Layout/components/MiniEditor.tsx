import { LayoutProps, useEditingStack, useLayoutActions } from "@/shell";
import { ReactNode, useEffect } from "react";

export function MiniEditor(props: LayoutProps["miniEditor"] & { children: ReactNode }) {
  const { edit, open } = useLayoutActions();

  useEffect(() => {
    if (props.resource) {
      edit(props.resource, props.context);
    }
  }, [props.resource]);

  return <div style={{ flex: 1, display: "flex" }}>{props.children}</div>;
}
