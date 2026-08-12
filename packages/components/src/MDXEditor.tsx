import "@mdxeditor/editor/style.css";
import "iiif-browser/mdx-plugins.css";
import {
  MDXEditor as BaseMDXEditor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  diffSourcePlugin,
  headingsPlugin,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  type MDXEditorMethods,
  type MDXEditorProps,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { InsertIIIFBrowser, iiifBrowserPlugin } from "iiif-browser/mdxeditor";
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
          iiifBrowserPlugin({
            browserProps: {
              navigation: {
                canSelectCollection: false,
                canSelectManifest: false,
                canSelectCanvas: true,
              },
            },
          }),
          linkDialogPlugin(),
          diffSourcePlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle options={["bullet", "number"]} />
                <CreateLink />
                <InsertIIIFBrowser />
              </>
            ),
          }),
        ],
        [],
      )}
      {...props}
      ref={editorRef}
    />
  );
}
