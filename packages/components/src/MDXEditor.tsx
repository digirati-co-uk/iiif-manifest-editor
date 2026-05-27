import "@mdxeditor/editor/style.css";
import {
  MDXEditor as BaseMDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import { type ForwardedRef, useMemo } from "react";

// Only import this to the next file
export function MDXEditor({
  editorRef,
  ...props
}: { editorRef?: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <BaseMDXEditor
      plugins={useMemo(
        () => [
          // Example Plugin Usage
          headingsPlugin({ allowedHeadingLevels: [2, 3] }),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          imagePlugin(),
          diffSourcePlugin(),
        ],
        [],
      )}
      {...props}
      ref={editorRef}
    />
  );
}
