import { DrawBox, RegionHighlight, ResizeWorldItem, useControlledAnnotationList } from "@atlas-viewer/atlas";
import { useState } from "react";
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

// export function Annotation({ annotation }: { annotation: any }) {
//   return (
//     <world-object
//       x={0}
//       y={0}
//       width={getAnnotationTarget(annotation).width}
//       height={getAnnotationTarget(annotation).height}
//     >
//       <box
//         interactive
//         // onClick={(e) => {
//         //   e.preventDefault();
//         //   e.stopPropagation();
//         //   // onClick(region);
//         // }}
//         target={{
//           x: getAnnotationTarget(annotation).x,
//           y: getAnnotationTarget(annotation).y,
//           width: getAnnotationTarget(annotation).width,
//           height: getAnnotationTarget(annotation).height,
//         }}
//         style={{ backgroundColor: "rgba(0, 0, 0, 0.4" }}
//       />
//     </world-object>
//   );
// }

export function Annotations({ canvasId }: { canvasId: string }) {
  const annotations = useAnnotationList(canvasId);
  const canvas = useCanvas({ id: canvasId }) as any;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string>();
  return (
    <world-object height={canvas.height} width={canvas.width}>
      {isEditing && !selectedAnnotation ? <DrawBox onCreate={() => console.log("createNewFunctionNeeded")} /> : null}
      {annotations.map((annotation: any) => {
        if (annotation.target) {
          return (
            <RegionHighlight
              interactive
              key={annotation.id}
              region={getAnnotationTarget(annotation)}
              isEditing={selectedAnnotation === annotation.id && isEditing}
              onSave={() => {
                // on save function goes here
              }}
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
