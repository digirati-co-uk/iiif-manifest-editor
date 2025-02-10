import {
  useCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import { CanvasContext } from "react-iiif-vault";
import { ExhibitionContainer } from "./ExhibitionContainer";
import { ExhibitionItem } from "./ExhibitionItem";

export function ExhibitionGrid() {
  const { open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const [, canvasActions] = useCreator(
    { id: technical.id.get(), type: "Manifest" },
    "items",
    "Manifest",
  );
  const items = structural.items.get();

  return (
    <ExhibitionContainer>
      {items.map((item, index) => (
        <CanvasContext key={index} canvas={item.id}>
          <ExhibitionItem
            isFirst={index === 0}
            item={item}
            onClick={() => {
              open({ id: "current-canvas" });
              canvasActions.edit(item, index);
            }}
          />
        </CanvasContext>
      ))}
    </ExhibitionContainer>
  );
}
