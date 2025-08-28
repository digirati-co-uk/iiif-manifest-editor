import { createRangeHelper, getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ErrorMessage, Sidebar, SidebarContent, SidebarHeader, WarningMessage } from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";
import { useMemo } from "react";
import { LocaleString, useCanvas, useManifest, useVault } from "react-iiif-vault";
import { RangeCreateEmpty } from "./components/RangesCreateEmpty";

export const rangesPanel: LayoutPanel = {
  id: "@manifest-editor/ranges-listing",
  label: "Ranges",
  icon: <RangesIcon />,
  render: () => {
    return <RangeLeftPanel />;
  },
};

export function RangesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M17 4v16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-4-2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H4V4h9zm8-14v12c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5"
      />
    </svg>
  );
}

export function RangeLeftPanel() {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);

  const topLevelRange = useMemo(() => {
    if (!manifest?.structures?.[0]) {
      return null;
    }

    return helper.rangesToTableOfContentsTree(vault.get(manifest!.structures || []));
  }, [manifest]);

  const isContiguous = useMemo(() => {
    if (!manifest?.structures?.[0]) {
      return null;
    }

    return helper.isContiguous((manifest!.structures || [])[0]!, manifest!.items, { detail: true });
  }, [manifest]);

  if (!topLevelRange) {
    return <RangeCreateEmpty />;
  }

  return (
    <Sidebar>
      <SidebarHeader title={topLevelRange.label || "Untitled range"} />
      <SidebarContent className="p-2">
        {topLevelRange.isVirtual ? (
          <WarningMessage className="mb-2">This is a virtual top level range</WarningMessage>
        ) : null}
        {!isContiguous ? <WarningMessage className="mb-2">Warning: Non-contiguous range</WarningMessage> : null}
        <RangeNode item={topLevelRange} />
      </SidebarContent>
    </Sidebar>
  );
}

function RangeNode({ item }: { item: RangeTableOfContentsNode }) {
  return (
    <>
      <div key={item.id} className="flex gap-1">
        <div className="w-5">{item.isCanvasLeaf ? null : <ArrowDown className="text-xl" />}</div>
        {item.type === "Canvas" ? (
          <CanvasLabel className="flex-1 truncate" id={item.resource?.source.id} />
        ) : (
          <LocaleString
            className="flex-1 truncate"
            defaultText={(<span className="text-black/50">Untitled range</span>) as any}
          >
            {item.label}
          </LocaleString>
        )}
        <div>{!item.isCanvasLeaf ? item.items?.length : null}</div>
      </div>
      {item.items?.length ? (
        <div className="ml-6">
          {item.items?.map((inner: any) => (
            <RangeNode key={inner.id} item={inner} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function CanvasLabel({ id, className }: { id: string; className?: string }) {
  const canvas = useCanvas({ id });

  const noValue = getValue(canvas?.label);

  if (!noValue) {
    return <div className={className}>Untitled canvas</div>;
  }

  return (
    <LocaleString className={className} defaultText={(<span className="text-gray-500">Untitled canvas</span>) as any}>
      {canvas?.label || { en: ["Untitled canvas"] }}
    </LocaleString>
  );
}

export function RangesListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-1 12H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1"
      />
    </svg>
  );
}

export function CanvasesListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H6V4h5v7l2.5-1.5L16 11V4h2zm-4.38-6.5L17 18H7l2.38-3.17L11 17z"
      />
    </svg>
  );
}

export function ArrowDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z" />
    </svg>
  );
}
