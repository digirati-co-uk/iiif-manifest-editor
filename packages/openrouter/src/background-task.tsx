import {
  useLayoutState,
  type BackgroundPanel,
} from "@manifest-editor/shell";
import { OPENROUTER_BACKGROUND_ID, OPENROUTER_PANEL_ID } from "./constants";
import { OpenRouterControllerHost } from "./controller-host";

function OpenRouterBackgroundEffects() {
  const layout = useLayoutState();
  const isAssistantVisible = layout.leftPanel.open && layout.leftPanel.current === OPENROUTER_PANEL_ID;

  return <OpenRouterControllerHost isAssistantVisible={isAssistantVisible} />;
}

export const openRouterBackgroundTask: BackgroundPanel = {
  id: OPENROUTER_BACKGROUND_ID,
  label: "OpenRouter background",
  render: () => <OpenRouterBackgroundEffects />,
};
