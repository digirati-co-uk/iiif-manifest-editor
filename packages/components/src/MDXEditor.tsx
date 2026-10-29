import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import { lazy, Suspense, type ForwardedRef } from "react";
import { Spinner } from "./Spinner";

const Editor = lazy(() => import("./MDXEditorImpl").then((module) => ({ default: module.MDXEditor })));

/** npm hosts split this chunk; the single-script CDN defers its initialization. */
export function MDXEditor(props: { editorRef?: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <Editor {...props} />
    </Suspense>
  );
}
