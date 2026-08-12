import { LocaleString } from "react-iiif-vault/presentation-4";
import { cn } from "./utils";
import { InternationalString } from "@iiif/parser";

export function MetadataContainer({
  className,
  label,
  children,
  ...props
}: { label: InternationalString | null } & React.HTMLAttributes<HTMLFieldSetElement>) {
  return (
    <fieldset
      className={cn(
        "hover:ring ring-gray-200 focus-within:ring-me-primary-500 focus-within:ring p-2 rounded mb-2",
        className
      )}
      {...props}
    >
      <LocaleString className="text-lg font-bold text-[#333] mb-2" as={"h3"}>
        {label}
      </LocaleString>
      {children}
    </fieldset>
  );
}
