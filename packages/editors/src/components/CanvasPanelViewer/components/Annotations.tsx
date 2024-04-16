import { DrawBox, RegionHighlight } from "@atlas-viewer/atlas";
import { useCanvas } from "react-iiif-vault";
import { useAnnotationList } from "../../../hooks/useAnnotationList";

function getAnnotationTarget(annotation: any, canvas: any) {
  if (!annotation.target.includes("#xywh=")) {
    return {
      id: annotation.id,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    };
  }
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
              region={getAnnotationTarget(annotation, canvas)}
              isEditing={isEditing && selectedAnnotation === annotation.id}
              onSave={editAnnotation}
              onClick={() => {
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
