import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceActionBar.styles";
import { DownIcon } from "@/icons/DownIcon";
import { ComboButton } from "./ComboButton";

export function ResourceActionBar() {
  return (
    <div className={$.ResourceActionBarContainer}>
      <div className={$.ResourceActionMeta}>
        <a href="#" className={$.ResourceActionLabel}>
          https://example.org/manifest
        </a>
        <div className={$.ResourceActionDescription}>Manifest</div>
      </div>
      <div className={$.ResourceActions}>
        <ComboButton
          actions={[
            {
              label: "Select",
              action: () => console.log("select.."),
            },
          ]}
        />
      </div>
    </div>
  );
}
