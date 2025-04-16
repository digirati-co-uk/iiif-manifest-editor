import { InfoIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { type LayoutPanel, useCollectionEditor, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { type SVGProps, useEffect, useRef } from "react";
import { LocaleString, ManifestMetadata, Metadata } from "react-iiif-vault";

export const collectionSummary: LayoutPanel = {
  id: "collection-summary",
  label: "Collection summary",
  icon: <InfoIcon />,
  render: (state, ctx, app) => {
    return (
      <Sidebar>
        <SidebarHeader title="Collection summary" />
        <SidebarContent className="p-4">
          <CollectionSummaryPanel />
        </SidebarContent>
      </Sidebar>
    );
  },
};

export function CollectionSummaryPanel() {
  const { edit, open } = useLayoutActions();
  const { descriptive, technical } = useCollectionEditor();
  const collectionId = technical.id.get();
  const collection = { id: collectionId, type: "Collection" };
  const isInitial = useRef(true);

  const label = descriptive.label.get();
  const summary = descriptive.summary.get();
  const requiredStatement = descriptive.requiredStatement.get();
  const metadata = descriptive.metadata.get();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only runs once.
  useEffect(() => {
    // if (!current || !isInitial.current) {
    edit(collection);
    // }
    open({ id: "collection-overview" });

    isInitial.current = false;
  }, []);

  return (
    <>
      {label ? (
        <LocaleString as="h2" className="text-lg font-semibold mb-2 [&>a]:underline [&>a]:hover:text-slate-400">
          {label}
        </LocaleString>
      ) : null}

      {summary ? (
        <LocaleString
          enableDangerouslySetInnerHTML
          as="p"
          className="text-sm text-slate-800 block [&>a]:underline [&>a]:hover:text-slate-400 mb-2"
        >
          {summary}
        </LocaleString>
      ) : null}

      <hr />
      {requiredStatement ? (
        <>
          <div className="py-2 text-black">
            <LocaleString
              as="h4"
              className="font-bold text-black w-full text-sm font-semibold mb-0 [&>a]:underline [&>a]:hover:text-slate-400"
            >
              {requiredStatement.label}
            </LocaleString>
            <LocaleString enableDangerouslySetInnerHTML className="text-sm [&>a]:underline [&>a]:hover:text-slate-400">
              {requiredStatement.value}
            </LocaleString>
          </div>

          <hr />
        </>
      ) : null}

      {metadata && metadata.length === 0 ? (
        <div className="py-2 text-gray-400">
          You can add some descriptive metadata for this Collection using the editing panel on the right
        </div>
      ) : null}

      <Metadata
        metadata={metadata}
        allowHtml
        classes={{
          container: "w-full",
          row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
          label: "font-bold text-black w-full text-sm font-semibold mb-1",
          value: "text-sm text-black block [&>span>a]:underline [&>span>a]:hover:text-slate-400",
          empty: "text-gray-400",
        }}
      />
    </>
  );
}
