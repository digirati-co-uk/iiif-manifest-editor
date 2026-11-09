import { lazy, Suspense, type ComponentProps } from "react";
import { Spinner } from "./Spinner";

const Editor = lazy(() => import("./HTMLEditorImpl").then((module) => ({ default: module.HTMLEditor })));

export function HTMLEditor(props: ComponentProps<typeof Editor>) {
  // Mount the implementation together so its ref/save effects see the loaded editor.
  return (
    <Suspense fallback={<Spinner />}>
      <Editor {...props} />
    </Suspense>
  );
}
