import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceNavigation.styles";
import folder from "@/components/widgets/IIIFExplorer/icons/folder.svg";
import back from "../icons/back.svg";
import { useState } from "react";
import { DownIcon } from "@/icons/DownIcon";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized, Manifest, ManifestNormalized } from "@iiif/presentation-3";
import { LocaleString } from "@/atoms/LocaleString";

export function ResourceNavigation() {
  const store = useExplorerStore();
  const [open, setIsOpen] = useState(false);
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const history = useStore(store, (s) => s.history);
  const backAction = useStore(store, (s) => s.back);

  const historyItems = useVaultSelector(
    (state, vault) => {
      return history.map((id) => {
        return {
          id,
          resource: vault.get(id, { skipSelfReturn: false }),
          status: vault.requestStatus(id),
        };
      });
    },
    [history]
  );

  return (
    <div className={$.resourceNavContainer}>
      <div className={$.resourceNavIcon} data-disabled={history.length < 2}>
        <img src={back} onClick={backAction} />
      </div>
      <div className={$.resourceNavList} data-collapsed={!open}>
        {historyItems.map((item, idx) => {
          const isSelected = item.id === selected;
          const resource = item.resource as ManifestNormalized | CollectionNormalized;
          return (
            <a
              href={item.id}
              className={$.resourceNavListItem}
              key={item.id}
              data-active={isSelected}
              data-index={idx}
              onClick={(e) => {
                if (e.ctrlKey) {
                  return;
                }
                e.preventDefault();
                select(item.id);
                setIsOpen(false);
              }}
            >
              <div className={$.resourceNavListItemIcon}>
                <img src={folder} alt="" />
              </div>
              <div className={$.resourceNavListItemLabel}>
                <LocaleString>{resource.label}</LocaleString>
              </div>
            </a>
          );
        })}
      </div>
      <div className={$.resourceNavIcon} data-disabled={history.length < 2} onClick={() => setIsOpen((t) => !t)}>
        <DownIcon rotate={open ? 0 : 90} width={undefined} height={undefined} />
      </div>
    </div>
  );
}
