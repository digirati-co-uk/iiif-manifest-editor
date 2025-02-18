import "@mdxeditor/editor/style.css";
import {
  MDXEditor as BaseMDXEditor,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  ListsToggle,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { useMemo, type ForwardedRef } from "react";

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
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          // linkDialogPlugin(),
          markdownShortcutPlugin(),
          imagePlugin(),
          toolbarPlugin({
            toolbarClassName: "mdx-toolbar",
            toolbarContents: () => (
              <>
                {" "}
                <UndoRedo />
                <ListsToggle />
                <BoldItalicUnderlineToggles />
                {/* <CreateLink /> */}
                <InsertImage />
              </>
            ),
          }),
        ],
        []
      )}
      {...props}
      ref={editorRef}
    />
  );
}
