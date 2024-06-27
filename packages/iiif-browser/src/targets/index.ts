import { clipboardTarget } from "./clipboard";
import { callbackTarget } from "./callback";
import { inputTarget } from "./input";
import { ExplorerAction, OutputTarget } from "../IIIFExplorer.types";
import { openNewWindowTarget } from "./open-new-window";

export const targets: { [K in OutputTarget["type"]]: ExplorerAction<K> } = {
  clipboard: clipboardTarget,
  callback: callbackTarget,
  input: inputTarget,
  "open-new-window": openNewWindowTarget,
};
