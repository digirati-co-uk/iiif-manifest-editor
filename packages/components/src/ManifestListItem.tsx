import { Button } from "react-aria-components";
import { LocaleString, useManifest } from "react-iiif-vault";
import { ManifestIcon } from "./icons/ManifestIcon";

export function ManifestListItem({ isActive, onAction }: { isActive: boolean; onAction: () => void }) {
  const manifest = useManifest();

  return (
    <Button
      className="border-b-2 border-b-gray-200 flex p-2 gap-3 text-left truncate items-center w-full hover:bg-gray-100 data-[active]:bg-gray-200 data-[active]:border-b-me-primary-500"
      onPress={onAction}
      data-active={isActive || undefined}
    >
      <ManifestIcon
        data-active={isActive || undefined}
        className="flex-shrink-0 text-2xl data-[active]:text-me-primary-500 text-gray-400"
      />
      <LocaleString>{manifest?.label}</LocaleString>
    </Button>
  );
}
