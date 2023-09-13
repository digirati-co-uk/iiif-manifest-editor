import { LayoutProps, useEditingStack } from "@/shell";
import { ReactNode, useEffect } from "react";

export function MiniEditor(props: LayoutProps["miniEditor"] & { children: ReactNode }) {
  const { edit } = useEditingStack();

  useEffect(() => {
    if (props.resource) {
      edit(props.resource);
    }
  }, [props.resource]);

  return <div>{props.children}</div>;
}
