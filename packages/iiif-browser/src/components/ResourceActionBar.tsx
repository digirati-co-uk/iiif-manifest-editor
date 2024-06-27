import $ from "../styles/ResourceActionBar.module.css";
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
