import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceNavigation.styles";
import folder from "@/components/widgets/IIIFExplorer/icons/folder.svg";
import { LocaleString } from "@/atoms/LocaleString";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";

export function ResourceNavigationItem({
  item,
  id,
  isSelected,
  index,
  select,
}: {
  id: string;
  item: ManifestNormalized | CollectionNormalized;
  select: (item: ManifestNormalized | CollectionNormalized) => void;
  isSelected: boolean;
  index: number;
}) {
  return (
    <a
      href={id}
      className={$.resourceNavListItem}
      data-active={isSelected}
      data-index={index}
      onClick={(e) => {
        if (e.ctrlKey) {
          return;
        }
        e.preventDefault();
        select(item);
      }}
    >
      <div className={$.resourceNavListItemIcon}>
        <img src={folder} alt="" />
      </div>
      <div className={$.resourceNavListItemLabel}>
        <LocaleString>{item.label}</LocaleString>
      </div>
    </a>
  );
}
