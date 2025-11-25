import type { Reference } from "@iiif/presentation-3";
import { LocaleString, useVaultSelector } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";

export function ProviderLink({ className, item }: { className?: string; item: Reference<"WebPage"> }) {
  const webPage = useVaultSelector((_, vault) => vault.get(item), [item]);

  if (item.id.startsWith("http://example.org/")) {
    return null;
  }

  if (!webPage) {
    return null;
  }
  return (
    <a
      href={webPage.id}
      target="_blank"
      className={twMerge(
        `flex justify-between items-center group pe-2 focus:ring focus:outline-none ring-me-500 cursor-default underline-offset-4 underline focus:no-underline focus:bg-gray-50 rounded py-1 px-2`,
        className,
      )}
      rel="noreferrer"
    >
      <LocaleString
        enableDangerouslySetInnerHTML
        separator="<br>"
        className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
        defaultText="Go to link"
      >
        {webPage.label}
      </LocaleString>
    </a>
  );
}
