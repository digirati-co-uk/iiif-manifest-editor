import { RangeContext, useRange, useVault } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import invariant from "tiny-invariant";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { useMemo } from "react";
import { findFirstCanvasFromRange } from "./ViewRange.helpers";
import { RangeNavigationStyles as S } from "../RangeNavigation.styles";

export function ViewRange() {
  const range = useRange();
  const appState = useAppState();
  const first = useMemo(() => range?.items.find((i) => i.type === "Canvas"), [range]);
  const hasSubsequentRanges = useMemo(() => !!range?.items.find((i) => i.type === "Range"), [range]);
  const parsedFirstId = first ? first.id?.split("#")[0] : null;
  const selected = first && parsedFirstId === appState.state.canvasId;
  const vault = useVault();

  invariant(range);

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
        <S.ItemLabel onClick={onClick}>{getValue(range.label)}</S.ItemLabel>
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
