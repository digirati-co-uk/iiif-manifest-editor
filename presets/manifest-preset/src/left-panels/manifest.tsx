import { LayoutPanel, useEditingResource, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { SVGProps, useEffect, useRef } from "react";
import { LocaleString, ManifestMetadata } from "react-iiif-vault";
import { Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useLayoutState } from "../../../../packages/shell/dist/index.cjs";

function ManifestIcon({ title, titleId, ...props }: SVGProps<SVGSVGElement> & { title?: string; titleId?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}

      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="currentColor"
      />
    </svg>
  );
}

export const manifestPanel: LayoutPanel = {
  id: "left-panel-manifest",
  label: "Manifest summary",
  icon: <ManifestIcon />,
  render: (state, ctx, app) => {
    return <ManifestPanel />;
  },
};

function ManifestPanel() {
  const { edit, open } = useLayoutActions();
  const current = useEditingResource();
  const { descriptive, technical } = useManifestEditor();
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const isInitial = useRef(true);

  const label = descriptive.label.get();
  const summary = descriptive.summary.get();
  const requiredStatement = descriptive.requiredStatement.get();
  const metadata = descriptive.metadata.get();

  useEffect(() => {
    if (!current || !isInitial.current) {
      edit(manifest);
    }
    open({ id: "overview" });

    isInitial.current = false;
  }, []);

  return (
    <Sidebar>
      <SidebarHeader title="Manifest summary" />
      <SidebarContent className="p-4">
        {label ? (
          <LocaleString as="h2" className="text-lg font-semibold mb-2 [&>a]:underline [&>a]:hover:text-slate-400">
            {label}
          </LocaleString>
        ) : null}

        {summary ? (
          <LocaleString as="p" className="text-sm text-slate-800 block [&>a]:underline [&>a]:hover:text-slate-400 mb-2">
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
              <LocaleString
                enableDangerouslySetInnerHTML
                className="text-sm [&>a]:underline [&>a]:hover:text-slate-400"
              >
                {requiredStatement.value}
              </LocaleString>
            </div>

            <hr />
          </>
        ) : null}

        {metadata && metadata.length === 0 ? (
          <div className="py-2 text-gray-400">
            You can add some descriptive metadata for this manifest using the editing panel on the right
          </div>
        ) : null}

        <ManifestMetadata
          allowHtml
          classes={{
            container: "w-full",
            row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
            label: "font-bold text-black w-full text-sm font-semibold mb-1",
            value: "text-sm text-black block [&>span>a]:underline [&>span>a]:hover:text-slate-400",
            empty: "text-gray-400",
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
}
