import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, InfoIcon, SidebarContent } from "@manifest-editor/components";
import { useRangeSplittingStore } from "../../store/range-splitting-store";
import { SplitRangeIcon } from "../../icons";

export function RangeSplittingPreview() {
  const t = useTranslations("manifest");
  const { setIsSplitting } = useRangeSplittingStore();

  return (
    <SidebarContent>
      <ActionButton onPress={() => setIsSplitting(false)}>{t("workflow.exitSplittingMode")}</ActionButton>
      <div className="flex flex-col justify-center items-center px-4 gap-4">
        <SplitRangeIcon className="w-32 h-32 text-gray-300" />
        <div className="text-center text-black/80">{t("workflow.splitHelp")}</div>
        <div
          style={{
            background: "#EFF6FF",
            padding: "1em",
            border: "1px solid #1E40AF",
            borderRadius: "4px",
          }}
        >
          <InfoIcon fontSize={"18px"} height={30} fill={"#31539F"} style={{ float: "right" }} />
          {t("workflow.firstRangeHelp")}
        </div>
      </div>
    </SidebarContent>
  );
}
