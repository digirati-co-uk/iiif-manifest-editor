import { twMerge } from "tailwind-merge";
import { RangesIcon } from "../../icons";

export function EmptyRangeMessage({ extraClasses }: { extraClasses?: string }) {
  return (
    <div className={twMerge("rounded px-2 py-1 bg-white text-sm text-gray-700 flex flex-row gap-3", extraClasses)}>
      <div className="opacity-30">
        <RangesIcon height={100} width={100} />
      </div>
      <span className="py-6">
        This range does not yet have any canvases. <br />
        If you want to offer navigation to canvases, you can edit the range and add content.
      </span>
    </div>
  );
}
