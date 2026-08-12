import {
  CheckIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { InlineLocaleStringEditor } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useEditingResource,
  useEditingStack,
  useLayoutActions,
  useLayoutState,
  useManifestEditor,
} from "@manifest-editor/shell";
import type { SVGProps } from "react";
import { LocaleString, ManifestMetadata } from "react-iiif-vault";

export function ManifestIcon({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & { title?: string; titleId?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      aria-labelledby={titleId}
      {...props}
    >
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

function EditManifestMetadataIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="m15 16l-4 4h10v-4zm-2.94-8.81L3 16.25V20h3.75l9.06-9.06zm1.072-1.067l2.539-2.539l3.747 3.748L16.88 9.87z"
      />
    </svg>
  );
}

export function ManifestPanel() {
  const { descriptive, technical } = useManifestEditor();
  const id = technical.id.get();
  const label = descriptive.label.get();
  const summary = descriptive.summary.get();
  const requiredStatement = descriptive.requiredStatement.get();
  const metadata = descriptive.metadata.get();
  const editingResource = useEditingResource();
  const editingStack = useEditingStack();
  const { rightPanel } = useLayoutState();
  const { edit, rightPanel: rightPanelActions } = useLayoutActions();
  const isEditingManifest =
    rightPanel.open &&
    rightPanel.current === "@manifest-editor/editor" &&
    editingResource?.resource.source.id === id &&
    editingResource.resource.source.type === "Manifest";

  return (
    <Sidebar>
      <SidebarHeader
        title="Manifest summary"
        actions={[
          {
            icon: isEditingManifest ? (
              <CheckIcon className="text-xl" />
            ) : (
              <EditManifestMetadataIcon className="text-xl" />
            ),
            title: isEditingManifest ? "Finish editing" : "Edit metadata",
            toggled: isEditingManifest,
            onClick: () => {
              if (isEditingManifest) {
                rightPanelActions.close();
                editingStack.close();
                return;
              }

              edit({ id, type: "Manifest" }, undefined, {
                forceOpen: true,
                selectedTab: "@manifest-editor/descriptive-properties",
              });
            },
          },
        ]}
      />
      <SidebarContent className="p-4">
        <InlineLocaleStringEditor
          as="h2"
          placeholder="Add an exhibition title"
          className="text-lg font-semibold [&>a]:underline [&>a]:hover:text-slate-400"
          buttonClassName="border border-gray-300 bg-white p-2 pr-16 mb-3"
          editButtonClassName="top-1 right-1 bottom-auto opacity-100 shadow-none bg-me-gray-100 text-me-primary-700 font-semibold"
          editor={descriptive.label}
        >
          {label}
        </InlineLocaleStringEditor>

        <InlineLocaleStringEditor
          multiline
          enableDangerouslySetInnerHTML
          as="p"
          placeholder="Add an exhibition summary"
          className="text-sm text-slate-800 block [&>a]:underline [&>a]:hover:text-slate-400"
          buttonClassName="border border-gray-300 bg-white p-2 pr-16 mb-3"
          editButtonClassName="top-1 right-1 bottom-auto opacity-100 shadow-none bg-me-gray-100 text-me-primary-700 font-semibold"
          editor={descriptive.summary}
        >
          {summary}
        </InlineLocaleStringEditor>

        <hr />
        {requiredStatement ? (
          <>
            <div className="py-2 text-black">
              <LocaleString
                as="h3"
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
          <div className="py-2 text-gray-600">
            You can add some descriptive metadata for this manifest using the
            editing panel on the right
          </div>
        ) : null}

        <ManifestMetadata
          allowHtml
          classes={{
            container: "w-full",
            row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
            label: "font-bold text-black w-full text-sm font-semibold mb-1",
            value:
              "text-sm text-black block [&>span>a]:underline [&>span>a]:hover:text-slate-400",
            empty: "text-gray-600",
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
}
