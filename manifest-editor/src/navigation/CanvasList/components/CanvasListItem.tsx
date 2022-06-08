import { useCanvas } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import invariant from "tiny-invariant";
import { CanvasListStyles as S } from "../CanvasList.styles";
import { useAppState } from "../../../shell/AppContext/AppContext";

export function CanvasListItem() {
  const canvas = useCanvas();
  const appState = useAppState();

  invariant(canvas);

  const selected = appState.state.canvasId === canvas.id;

  return (
    <S.ItemContainer
      $selected={selected}
      onClick={() => {
        appState.setState({ canvasId: canvas.id })
      }}
    >
      <S.ItemLabel $unwrap={selected}>{getValue(canvas.label)}</S.ItemLabel>
      <S.ItemIdentifier>{canvas.id}</S.ItemIdentifier>
    </S.ItemContainer>
  );
}
