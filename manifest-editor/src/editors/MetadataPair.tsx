import { useState } from "react";
import { DropdownContent } from "../atoms/Dropdown";
import { PaddingComponentSmall } from "../atoms/PaddingComponent";
import { FlexContainer, FlexContainerColumn } from "../components/layout/FlexContainer";
import { MenuIcon } from "../icons/MenuIcon";
import { MoreHorizontal } from "../icons/MoreHorizontal";
import { LanguageFieldEditor } from "./generic/LanguageFieldEditor/LanguageFieldEditor";
import { DropdownItem } from "./LanguageSelector";

interface MetadataPairProps {
  removeItem: (idx: number) => void;
  index: number;
  availableLanguages: string[];
  field: any;
  onSave: (data: any, index?: number | undefined, property?: "label" | "value" | undefined) => void;
  reorder: (fromPosition: number, toPosition: number) => void;
  size: number;
}

export const MetadataPair: React.FC<MetadataPairProps> = ({
  removeItem,
  index,
  availableLanguages,
  onSave,
  field,
  reorder,
  size,
}) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const showContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // Disable the default context menu
    event.preventDefault();

    setContextMenuVisible(false);
    const newPosition = {
      x: event.pageX,
      y: event.pageY,
    };

    setAnchorPoint(newPosition);
    setContextMenuVisible(true);
  };
  return (
    <div>
      <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
        <div />
        <MenuIcon />
        <div
          style={{ padding: "0.25rem", cursor: "pointer" }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => showContextMenu(e)}
        >
          <MoreHorizontal />
        </div>
      </div>

      {contextMenuVisible && (
        <DropdownContent
          style={{ top: anchorPoint.y, left: anchorPoint.x - 150 }}
          onMouseLeave={() => setContextMenuVisible(false)}
        >
          <DropdownItem aria-label="delete" onClick={() => removeItem(index)}>
            Delete metadata pair
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              reorder(index, 0);
              setContextMenuVisible(false);
            }}
          >
            Move to beginning
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              reorder(index, size - 1);
              setContextMenuVisible(false);
            }}
          >
            Move to end
          </DropdownItem>
        </DropdownContent>
      )}
      <FlexContainer>
        <FlexContainerColumn style={{ width: "100%" }}>
          <LanguageFieldEditor
            label={"label"}
            disableMultiline
            fields={field.label || { none: [""] }}
            availableLanguages={availableLanguages}
            onSave={onSave}
            index={index}
            property={"label"}
          />
          <LanguageFieldEditor
            label={"value"}
            fields={field.value || { none: [""] }}
            availableLanguages={availableLanguages}
            onSave={onSave}
            index={index}
            property={"value"}
          />
        </FlexContainerColumn>
      </FlexContainer>
    </div>
  );
};
