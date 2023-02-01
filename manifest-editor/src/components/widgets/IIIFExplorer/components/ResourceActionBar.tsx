import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceActionBar.styles";
import { DownIcon } from "@/icons/DownIcon";

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
        <button className={$.ResourceAction}>Select</button>
      </div>
      {/*
      <div>Resource + action type</div>
      <div>Multiple action button</div>
      <div>Resource types</div>
      <ul>
        <li>Manifest</li>
        <li>Canvas</li>
        <li>Canvas region</li>
      </ul>
      <div>Different actions (examples)</div>
      <ul>
        <li>Select only image service</li>
        <li>Select thumbnail</li>
        <li>Wrap in manifest</li>
      </ul>
      */}
    </div>
  );
}
