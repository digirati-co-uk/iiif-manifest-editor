import { getValue } from "@iiif/helpers";
import { isSpecificResource, toRef } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import {
  ActionButton,
  AddIcon,
  CollectionIcon,
  EmptyState,
  IIIFBrowserIcon,
  ManifestIcon,
} from "@manifest-editor/components";
import { useCreator, useLayoutActions } from "@manifest-editor/shell";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { type ReactNode, useState } from "react";
import { InputLabel, InputLabelEdit } from "../Input";
import { ContentResourceList } from "../ContentResourceList/ContentResourceList";
import { CollectionItemList } from "../CollectionItemList/CollectionItemList";
import { RangeList } from "../RangeList";
import { AnnotationPageList } from "../AnnotationPageLIst/AnnotationPageList";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";

interface LinkingPropertyListProps {
  parent?: SpecificResource;
  property: string;
  containerId?: string;
  label: string;
  emptyLabel: string;
  creationType: string;
  initialData?: any;
  editTab?: string;
  singleMode?: boolean;
  reorder?: (ctx: { startIndex: number; endIndex: number }) => void;
  items?: Reference[];
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  inlineActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
  referenceOnly?: boolean;
}

export function LinkingPropertyList(props: LinkingPropertyListProps) {
  const [canCreate_, actions] = useCreator(props.parent?.source, props.property, props.creationType);
  const [isOpen, setIsOpen] = useState(false);
  const canCreate = props.singleMode ? (props.items || []).length === 0 : canCreate_;
  const { edit } = useLayoutActions();

  let ListComponent: typeof ContentResourceList = ContentResourceList;
  switch (props.creationType) {
    case "Collection":
    case "Manifest":
      ListComponent = CollectionItemList as any;
      break;
    case "Range":
      ListComponent = RangeList as any;
      break;
    case "AnnotationPage":
      ListComponent = AnnotationPageList as any;
  }

  const items = props.items || [];
  return (
    <div id={props.containerId} className="mb-2">
      <div className="flex flex-col gap-2">
        {!items.length ? (
          <>
            <InputLabel>{props.label}</InputLabel>
            <EmptyState $noMargin $box>
              {props.emptyLabel}
            </EmptyState>
          </>
        ) : (
          <InputLabel>
            {props.label}
            <InputLabelEdit data-active={isOpen} onClick={() => setIsOpen((o) => !o)} />
          </InputLabel>
        )}
        {props.referenceOnly ? (
          <ReferenceOnlyList
            list={items}
            inlineHandle={false}
            reorder={isOpen ? props.reorder : undefined}
            onSelect={(e, index) => {
              const ref = isSpecificResource(e) ? e.source : e;
              edit(
                props.property === "partOf" && ref
                  ? {
                      type: "SpecificResource",
                      source: {
                        ...ref,
                        originalType: ref.type,
                        type: "ContentResource",
                      },
                    }
                  : e,
                { parent: toRef(props.parent?.source || props.parent) as any, property: props.property, index },
                { selectedTab: props.editTab },
              );
            }}
            createActions={props.createActions}
            inlineActions={props.inlineActions}
          />
        ) : (
          <ListComponent
            list={items}
            inlineHandle={false}
            reorder={isOpen ? props.reorder : undefined}
            onSelect={(e, index) => {
              actions.edit(e, index);
            }}
            createActions={props.createActions}
          />
        )}
      </div>
      {canCreate ? (
        <ActionButton onPress={() => actions.create(undefined, props.initialData)}>
          <AddIcon /> Add {props.label}
        </ActionButton>
      ) : null}
    </div>
  );
}

function ReferenceOnlyList(props: {
  list: Array<Reference | SpecificResource>;
  reorder?: (ctx: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  inlineActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
}) {
  if (props.reorder) {
    return (
      <ReorderList
        id="reorder-part-of-list"
        marginBottom="0.5em"
        items={props.list as Array<Reference & { id: string }>}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(item, index) => <ReferenceOnlyItem item={item} onClick={() => props.onSelect(item, index)} />}
        createActions={props.createActions as any}
        inlineActions={props.inlineActions as any}
      />
    );
  }

  return (
    <ul aria-label="Part of items">
      {props.list.map((item, index) => (
        <li key={`${index}_${item.id}`} className="flex items-stretch">
          <ReferenceOnlyItem item={item} onClick={() => props.onSelect(item, index)} />
          {props.inlineActions
            ? props.inlineActions((isSpecificResource(item) ? item.source : item) as Reference, index, item)
            : null}
        </li>
      ))}
    </ul>
  );
}

function ReferenceOnlyItem(props: { item: Reference | SpecificResource; onClick: () => void }) {
  const ref = isSpecificResource(props.item) ? props.item.source : props.item;
  const label = getValue(ref.label) || "";
  const summary = getValue(ref.summary) || "";
  const icon =
    ref.type === "Manifest" ? (
      <ManifestIcon className="flex-shrink-0 text-2xl text-gray-400" />
    ) : ref.type === "Collection" ? (
      <CollectionIcon className="flex-shrink-0 text-2xl text-gray-400" />
    ) : null;

  return (
    <button
      className="border-b-2 border-b-gray-200 flex p-2 gap-3 text-left truncate items-center w-full hover:bg-gray-100"
      onClick={props.onClick}
      type="button"
    >
      {icon}
      <span className="min-w-0">
        <span className="block truncate">{label || <span className="text-gray-500">Untitled {ref.type}</span>}</span>
        {summary ? <span className="block truncate text-xs text-gray-500">{summary}</span> : null}
      </span>
    </button>
  );
}

export function IIIFBrowserFromPartOfButton(props: { manifestId: string; openBrowser: (manifestId: string) => void }) {
  return (
    <ActionButton
      aria-label="IIIF Browser"
      className="rounded-none border-b-2 border-b-gray-200"
      onPress={() => props.openBrowser(props.manifestId)}
    >
      <IIIFBrowserIcon className="text-2xl" />
    </ActionButton>
  );
}
