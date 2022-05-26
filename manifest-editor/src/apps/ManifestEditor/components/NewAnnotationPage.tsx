import { WarningMessage } from "../../../atoms/callouts/WarningMessage";
import { Button } from "../../../atoms/Button";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { useLayoutActions } from "../../../shell/Layout/Layout.context";

export function NewAnnotationPage() {
  const { state } = useAppState();
  const { open } = useLayoutActions();

  return (
    <div>
      <WarningMessage>Not yet implemented</WarningMessage>
      New annotation page
      {state.canvasId ? (
        <Button onClick={() => open("canvas-properties", { current: 2 })}>Back to canvas</Button>
      ) : null}
    </div>
  );
}
