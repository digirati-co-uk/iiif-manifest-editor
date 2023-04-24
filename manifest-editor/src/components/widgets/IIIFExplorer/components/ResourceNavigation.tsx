import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceNavigation.styles";
import back from "../icons/back.svg";
import { useState } from "react";
import { DownIcon } from "@/icons/DownIcon";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { ResourceNavigationItem } from "@/components/widgets/IIIFExplorer/components/ResourceNavigationItem";

export function ResourceNavigation(props: { canReset?: boolean; onBack?: () => void }) {
  const store = useExplorerStore();
  const [open, setIsOpen] = useState(false);
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const history = useStore(store, (s) => s.history);
  const backAction = useStore(store, (s) => s.back);

  const goBack = () => {
    if (!props.canReset && history.length < 2) {
      if (props.onBack) {
        props.onBack();
      }
    } else {
      backAction();
    }
  };

  const historyItems = useVaultSelector(
    (state, vault) => {
      return history.map((resource) => {
        return {
          id: resource.id,
          type: resource.type,
          resource: vault.get(resource, { skipSelfReturn: false }),
          status: vault.requestStatus(resource.id),
        };
      });
    },
    [history]
  );

  return (
    <div className={$.resourceNavContainer}>
      <div className={$.resourceNavIcon} data-disabled={!props.onBack && !props.canReset && history.length < 2}>
        <img src={back} onClick={goBack} />
      </div>
      <div className={$.resourceNavList} data-collapsed={!open}>
        {historyItems.map((item, idx) => {
          const isSelected = item.id === selected?.id;
          const resource = item.resource as ManifestNormalized | CollectionNormalized;
          return (
            <ResourceNavigationItem
              key={item.id}
              id={item.id}
              isSelected={isSelected}
              index={idx}
              select={() => {
                select(item);
                setIsOpen(false);
              }}
              item={resource}
            />
          );
        })}
      </div>
      <div className={$.resourceNavIcon} data-disabled={history.length < 2} onClick={() => setIsOpen((t) => !t)}>
        <DownIcon rotate={open ? 0 : 90} width={undefined} height={undefined} />
      </div>
    </div>
  );
}
