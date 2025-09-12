import { ActionButton, SidebarContent } from "@manifest-editor/components";
import { useRangeSplittingStore } from "../../store/range-splitting-store";
import { SplitRangeIcon } from "../range-listing";

export function RangeSplittingPreview() {
  const { isSplitting, splitEffect, setIsSplitting } = useRangeSplittingStore();

  return (
    <SidebarContent>
      <ActionButton onPress={() => setIsSplitting(false)}>Exit splitting mode</ActionButton>
      <div className="flex flex-col justify-center items-center px-4 gap-4">
        <SplitRangeIcon className="w-32 h-32 text-gray-300" />
        <div className="text-center text-black/80">Hover to select items and then click to split a new range</div>
      </div>
    </SidebarContent>
  );
}
