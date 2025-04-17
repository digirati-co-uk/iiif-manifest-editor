import { Button } from "react-aria-components";
import { LocaleString, useCollection } from "react-iiif-vault";
import { CollectionIcon } from "./icons/CollectionIcon";

export function CollectionListItem({ isActive, onAction }: { isActive: boolean; onAction: () => void }) {
  const collection = useCollection({} as any);

  return (
    <Button
      className="border-b-2 border-b-gray-200 flex p-2 gap-3 text-left truncate items-center w-full hover:bg-gray-100 data-[active]:bg-gray-200 data-[active]:border-b-me-primary-500"
      onPress={onAction}
      data-active={isActive || undefined}
    >
      <CollectionIcon
        data-active={isActive || undefined}
        className="flex-shrink-0 text-2xl data-[active]:text-me-primary-500 text-gray-400"
      />
      <LocaleString>{collection?.label}</LocaleString>
    </Button>
  );
}
