import { twMerge } from "tailwind-merge";
import { RangesIcon } from "../../icons";

export function EmptyRangeMessage({ extraClasses }: { extraClasses?: string }) {
  return (
    <div
      className={twMerge(
        "rounded p-4 bg-white/40 text-sm text-gray-700 flex flex-row gap-5 items-center",
        extraClasses,
      )}
    >
      <div className="opacity-30">
        <RangesIcon className="h-24 w-24" />
      </div>
      <div>
        <h3 className="text-xl mb-3">Empty range</h3>
        <p>
          This range does not yet have any canvases. <br />
          If you want to offer navigation to canvases, you can edit the range and add content.
        </p>
      </div>
    </div>
  );
}
