import { useCanvas } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import invariant from "tiny-invariant";
import { CanvasListStyles as S } from "../CanvasList.styles";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { UniversalCopyTarget } from "../../../shell/Universal/UniversalCopyPaste";

export function CanvasListItem() {
  const canvas = useCanvas();
  const appState = useAppState();

  invariant(canvas);

  const selected = appState.state.canvasId === canvas.id;

  return (
    <UniversalCopyTarget
      as={S.ItemContainer}
      reference={{ id: canvas.id, type: "Canvas" }}
      $selected={selected}
      onClick={() => {
        appState.setState({ canvasId: canvas.id });
      }}
    >
      <S.ItemLabel $unwrap={selected}>{getValue(canvas.label)}</S.ItemLabel>
      <S.ItemIdentifier>{canvas.id}</S.ItemIdentifier>
    </UniversalCopyTarget>
  );
}
