import { RangeContext, useRange, useVault } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import invariant from "tiny-invariant";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { useMemo } from "react";
import { findAllCanvasesInRange, findFirstCanvasFromRange } from "./ViewRange.helpers";
import { RangeNavigationStyles as S } from "../RangeNavigation.styles";
import { useLayoutActions } from "../../../shell/Layout/Layout.context";
import { PreviewIcon } from "../../../icons/PreviewIcon";

export function ViewRange() {
  const range = useRange();
  const appState = useAppState();
  const first = useMemo(() => range?.items.find((i) => i.type === "Canvas"), [range]);
  const hasSubsequentRanges = useMemo(() => !!range?.items.find((i) => i.type === "Range"), [range]);
  const parsedFirstId = first ? first.id?.split("#")[0] : null;
  const selected = first && parsedFirstId === appState.state.canvasId;
  const layouts = useLayoutActions();
  const vault = useVault();

  invariant(range);

  function onClickPreview() {
    if (range) {
      const allItems = findAllCanvasesInRange(vault, range);
      if (allItems.length > 0) {
        appState.setState({ canvasId: allItems[0].id });
        layouts.centerPanel.open({ id: "thumbnail-grid", state: { canvasIds: allItems } });
      }
    }
  }

  function onClick() {
    if (first) {
      appState.setState({ canvasId: parsedFirstId });
    } else if (range) {
      // ... recursively find..
      const found = findFirstCanvasFromRange(vault, range);
      if (found) {
        const parsedId = found.id?.split("#")[0];
        appState.setState({ canvasId: parsedId });
      }
    }
  }

  return (
    <S.ItemOuterContainer data-range-id={range.id}>
      <S.ItemContainer $leaf={!hasSubsequentRanges} $selected={selected} $withSelector={first?.id.indexOf("#") !== -1}>
        <S.SplitLabel>
          <S.ItemLabel onClick={onClick}>{getValue(range.label)}</S.ItemLabel>
          <S.Preview onClick={onClickPreview}>
            <PreviewIcon />
          </S.Preview>
        </S.SplitLabel>
        {hasSubsequentRanges ? (
          <S.NestedContainer>
            {range.items.map((range) => {
              if (range.type === "Canvas") {
                return null;
              }

              return (
                <RangeContext key={range.id} range={range.id}>
                  <ViewRange />
                </RangeContext>
              );
            })}
          </S.NestedContainer>
        ) : null}
      </S.ItemContainer>
    </S.ItemOuterContainer>
  );
}
