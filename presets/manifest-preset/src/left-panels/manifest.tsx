import { LayoutPanel, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { SVGProps, useEffect } from "react";
import { ManifestMetadata } from "react-iiif-vault";

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
  label: "Manifest",
  icon: <ManifestIcon />,
  render: (state, ctx, app) => {
    return <ManifestPanel />;
  },
};

function ManifestPanel() {
  const { edit, open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };

  useEffect(() => {
    edit(manifest);
    open({ id: "overview" });
  }, []);

  return (
    <div className="p-4">
      <div>TODO: HEADER</div>
      <div>TODO: LABEL</div>
      <div>TODO: SUMMARY</div>
      <div>TODO: REQUIRED STATEMENT</div>

      <ManifestMetadata
        allowHtml
        classes={{
          container: "w-full",
          row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
          label: "font-bold text-slate-600 w-full text-sm font-semibold mb-0",
          value: "text-sm text-slate-800 block [&>a]:underline",
          empty: "text-gray-400",
        }}
      />
    </div>
  );
}
