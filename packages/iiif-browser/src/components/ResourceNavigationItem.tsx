import { LocaleString } from "react-iiif-vault";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import $ from "../styles/ResourceNavigation.module.css";

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
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <g id="Design-3.0" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Artboard">
              <g id="folder-icon" transform="translate(5.000000, 6.000000)" fillRule="nonzero">
                <path
                  d="M1.125,12 C0.825,12 0.5625,11.884375 0.3375,11.653125 C0.1125,11.421875 0,11.1625 0,10.875 L0,1.125 C0,0.8375 0.1125,0.578125 0.3375,0.346875 C0.5625,0.115625 0.825,0 1.125,0 L6.375,0 L7.5,2.125 L13.875,2.125 C14.1625,2.125 14.421875,2.240625 14.653125,2.471875 C14.884375,2.703125 15,2.9625 15,3.25 L15,10.875 C15,11.1625 14.884375,11.421875 14.653125,11.653125 C14.421875,11.884375 14.1625,12 13.875,12 L1.125,12 Z"
                  id="Path"
                  fill="#717171"
                ></path>
                <path
                  d="M1.125,12 C0.825,12 0.5625,11.884375 0.3375,11.653125 C0.1125,11.421875 0,11.1625 0,10.875 L0,1.99558699 L13.875,1.99558699 C14.1625,1.99558699 14.421875,2.11121199 14.653125,2.34246199 C14.884375,2.57371199 15,2.83308699 15,3.12058699 L15,10.875 C15,11.1625 14.884375,11.421875 14.653125,11.653125 C14.421875,11.884375 14.1625,12 13.875,12 L1.125,12 Z"
                  id="Path"
                  fill="#AAAAAA"
                ></path>
              </g>
              <rect id="Rectangle" x="0" y="0" width="24" height="24"></rect>
            </g>
          </g>
        </svg>
      </div>
      <div className={$.resourceNavListItemLabel}>
        <LocaleString>{item.label}</LocaleString>
      </div>
    </a>
  );
}
