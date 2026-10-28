import { IIIFBrowserI18nProvider } from "./IIIFBrowserI18n";
import { ComponentI18nProvider } from "./ComponentI18nProvider";
import { useTranslations } from "@manifest-editor/i18n";
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
  Separator,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { InsertIIIFBrowser, iiifBrowserPlugin } from "iiif-browser/mdxeditor";
import { type ForwardedRef, useMemo } from "react";

// Only import this to the next file
export function MDXEditor({
  editorRef,
  ...props
}: { editorRef?: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const t = useTranslations("components");
  const dialogTitle = t("mdx.iiif.title");
  const optionsTitle = t("mdx.iiif.options");
  const closeLabel = t("actions.close");
  const actionLabel = t("mdx.iiif.action");
  const selectLabel = t("mdx.iiif.select");
  return (
    <ComponentI18nProvider>
      <IIIFBrowserI18nProvider>
        <BaseMDXEditor
          translation={(key, defaultValue, values) => t(`mdx.${key}`, values, { defaultValue })}
          plugins={useMemo(
            () => [
              // Example Plugin Usage
              headingsPlugin({ allowedHeadingLevels: [2, 3] }),
              listsPlugin(),
              linkPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              iiifBrowserPlugin({
                dialog: { title: dialogTitle, optionsTitle, closeLabel },
                image: { actionLabel, selectLabel },
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
                toolbarContents: LocalizedToolbar,
              }),
            ],
            [dialogTitle, optionsTitle, closeLabel, actionLabel, selectLabel]
          )}
          {...props}
          ref={editorRef}
        />
      </IIIFBrowserI18nProvider>
    </ComponentI18nProvider>
  );
}

function LocalizedToolbar() {
  const t = useTranslations("components");
  return (
    <>
      <BoldItalicUnderlineToggles />
      <CreateLink />
      <Separator />
      <BlockTypeSelect />
      <ListsToggle options={["bullet", "number"]} />
      <Separator />
      <InsertIIIFBrowser label={t("mdx.iiif.insert")} />
    </>
  );
}
