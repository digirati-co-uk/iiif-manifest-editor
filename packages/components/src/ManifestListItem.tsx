import { LocaleString, useManifest } from "react-iiif-vault";
import { ManifestIcon } from "./icons/ManifestIcon";
import { usePress } from "react-aria";
import { getValue } from "@iiif/helpers";

export function ManifestListItem({ isActive, onAction }: { isActive: boolean; onAction: () => void }) {
  const manifest = useManifest();
  const { pressProps } = usePress({
    onPress: onAction,
  });

  return (
    <li
      aria-label={getValue(manifest?.label)}
      className="border-b-2 border-b-gray-200 flex p-2 gap-3 text-left truncate items-center w-full hover:bg-gray-100 data-[active]:bg-gray-200 data-[active]:border-b-me-primary-500"
      data-active={isActive || undefined}
      {...pressProps}
    >
      <ManifestIcon
        data-active={isActive || undefined}
        className="flex-shrink-0 text-2xl data-[active]:text-me-primary-500 text-gray-400"
      />
      <LocaleString>{manifest?.label}</LocaleString>
    </li>
  );
}
