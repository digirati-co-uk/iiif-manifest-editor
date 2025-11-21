import { Checkbox } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function SelectionCheckbox({ alwaysVisible }: { alwaysVisible?: boolean }) {
  return (
    <Checkbox
      slot="selection"
      className={twMerge(
        "bg-white/50",
        "group-hover:opacity-100 block h-5 w-5 shrink-0 rounded border border-gray-300 hover:border-gray-400 ring-offset-1",
        "data-[disabled]:hidden data-[indeterminate]:bg-me-700 data-[selected]:bg-me-700 data-[indeterminate]:text-white",
        "data-[selected]:border-me-700 data-[indeterminate]:border-me-700",
        "data-[selected]:text-white data-[disabled]:opacity-50 data-[focus-visible]:outline-none data-[focus-visible]:ring-2",
        "data-[focus-visible]:ring-me-700 data-[focus-visible]:ring-offset-2 data-[focus-visible]:opacity-100",
        !alwaysVisible &&
          "opacity-0 group-hover:opacity-100 data-[selected]:opacity-100 data-[indeterminate]:opacity-100",
      )}
    >
      {({ isSelected, isIndeterminate }) => (
        <div className="flex items-center justify-center text-current">
          <svg viewBox="0 -960 960 960" aria-hidden="true" fill="currentColor">
            {isIndeterminate ? (
              <path d="M160-440v-80h640v80H160Z" />
            ) : isSelected ? (
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            ) : null}
          </svg>
        </div>
      )}
    </Checkbox>
  );
}
