import { useTranslations } from "@manifest-editor/i18n";
import { twMerge } from "tailwind-merge";
import { RangesIcon } from "../../icons";

export function EmptyRangeMessage({ extraClasses }: { extraClasses?: string }) {
  const t = useTranslations("manifest");
  return (
    <div
      className={twMerge(
        "rounded p-4 bg-white/40 text-sm text-gray-700 flex flex-row gap-5 items-center",
        extraClasses
      )}
    >
      <div className="opacity-30">
        <RangesIcon className="h-24 w-24" />
      </div>
      <div>
        <h3 className="text-xl mb-3">{t("workflow.emptyRange")}</h3>
        <p>
          {t("workflow.emptyRangeBody")}
          <br />
          {t("workflow.emptyRangeHelp")}
        </p>
      </div>
    </div>
  );
}
