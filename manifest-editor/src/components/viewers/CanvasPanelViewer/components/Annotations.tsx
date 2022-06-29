import { DrawBox, RegionHighlight, ResizeWorldItem, useControlledAnnotationList } from "@atlas-viewer/atlas";
import { useCanvas } from "react-iiif-vault";
import { useAnnotationList } from "../../../../hooks/useAnnotationsList";

function getAnnotationTarget(annotation: any) {
  const split = annotation.target.split("#xywh=")[1].split(",");
  return {
    id: annotation.id,
    x: parseInt(split[0]),
    y: parseInt(split[1]),
    width: parseInt(split[2]),
    height: parseInt(split[3]),
  };
}

export function Annotations({ canvasId }: { canvasId: string }) {
  const {
    annotations,
    isEditing,
    setIsEditing,
    addNewAnnotation,
    selectedAnnotation,
    setSelectedAnnotation,
    editAnnotation,
    onDeselect,
  } = useAnnotationList(canvasId);
  const canvas = useCanvas({ id: canvasId }) as any;

  return (
    <world-object height={canvas.height} width={canvas.width} onClick={onDeselect}>
      {isEditing && !selectedAnnotation ? <DrawBox onCreate={addNewAnnotation} /> : null}
      {annotations.map((annotation: any) => {
        if (annotation.target) {
          return (
            <RegionHighlight
              interactive
              key={annotation.id}
              region={getAnnotationTarget(annotation)}
              isEditing={isEditing && selectedAnnotation === annotation.id}
              onSave={editAnnotation}
              onClick={() => {
                console.log(annotation);
                setIsEditing(true);
                setSelectedAnnotation(annotation.id);
              }}
              style={
                selectedAnnotation === annotation.id && isEditing
                  ? { border: " 5px solid green" }
                  : { backgroundColor: " rgba(0, 0, 0, 0.4)" }
              }
            />
          );
        }
      })}
    </world-object>
  );
}
