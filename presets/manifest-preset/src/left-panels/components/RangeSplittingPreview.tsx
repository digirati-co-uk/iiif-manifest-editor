import { ActionButton, SidebarContent } from "@manifest-editor/components";
import { useRangeSplittingStore } from "../../store/range-splitting-store";
import { SplitRangeIcon } from "../../icons";
import { InfoIcon } from "@manifest-editor/ui/icons/InfoIcon";

export function RangeSplittingPreview() {
  const { setIsSplitting } = useRangeSplittingStore();

  return (
    <SidebarContent>
      <ActionButton onPress={() => setIsSplitting(false)}>
        Exit splitting mode
      </ActionButton>
      <div className="flex flex-col justify-center items-center px-4 gap-4">
        <SplitRangeIcon className="w-32 h-32 text-gray-300" />
        <div className="text-center text-black/80">
          Hover over the Canvases to select where you want to add a new range item. Click to select that Canvas.
          Note the first canvas can’t be split.
        </div>
        <div
          style={{
            background: "#EFF6FF",
            padding: "1em",
            border: "1px solid #1E40AF",
            borderRadius: "4px",
          }}
        >
          <InfoIcon
            fontSize={"18px"}
            height={30}
            fill={"#31539F"}
            style={{ float: "right" }}
          />
          Creating your first range adds one range called “Range 1”
          that contains every canvas. You can rename it, split it, or move canvases into sub-ranges.
        </div>
      </div>
    </SidebarContent>
  );
}
