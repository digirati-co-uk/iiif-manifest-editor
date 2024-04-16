import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { useState } from "react";
import { InputContainer, InputLabel, InputLabelEdit } from "../Input";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useCreator } from "@manifest-editor/shell";
import { ContentResourceList } from "../ContentResourceList/ContentResourceList";
import { RangeList } from "../RangeList";
import { AnnotationPageList } from "../AnnotationPageLIst/AnnotationPageList";
import { Button } from "@manifest-editor/ui/atoms/Button";

interface LinkingPropertyListProps {
  parent?: SpecificResource;
  property: string;
  containerId?: string;
  label: string;
  emptyLabel: string;
  creationType: string;
  singleMode?: boolean;
  reorder?: (ctx: { startIndex: number; endIndex: number }) => void;
  items?: Reference[];
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
}

export function LinkingPropertyList(props: LinkingPropertyListProps) {
  const [canCreate_, actions] = useCreator(props.parent?.source, props.property, props.creationType);
  const [isOpen, setIsOpen] = useState(false);
  const canCreate = props.singleMode ? (props.items || []).length === 0 : canCreate_;

  let ListComponent: typeof ContentResourceList = ContentResourceList;
  switch (props.creationType) {
    case "Range":
      ListComponent = RangeList as any;
      break;
    case "AnnotationPage":
      ListComponent = AnnotationPageList as any;
  }

  const items = props.items || [];
  return (
    <div id={props.containerId}>
      <InputContainer $wide>
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
        <ListComponent
          list={items}
          inlineHandle={false}
          reorder={isOpen ? props.reorder : undefined}
          onSelect={(e, index) => {
            actions.edit(e, index);
          }}
          createActions={props.createActions}
        />
      </InputContainer>
      {canCreate ? <Button onClick={() => actions.create()}>Add {props.label}</Button> : null}
    </div>
  );
}
