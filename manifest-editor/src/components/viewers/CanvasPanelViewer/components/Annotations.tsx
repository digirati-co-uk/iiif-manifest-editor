import { DrawBox, RegionHighlight, ResizeWorldItem, useControlledAnnotationList } from "@atlas-viewer/atlas";
import { useAnnotation, useVault } from "react-iiif-vault";
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

export function Annotation({ annotation }: { annotation: any }) {
  return (
    <world-object
      x={0}
      y={0}
      width={getAnnotationTarget(annotation).width}
      height={getAnnotationTarget(annotation).height}
    >
      <box
        interactive
        // onClick={(e) => {
        //   e.preventDefault();
        //   e.stopPropagation();
        //   // onClick(region);
        // }}
        target={{
          x: getAnnotationTarget(annotation).x,
          y: getAnnotationTarget(annotation).y,
          width: getAnnotationTarget(annotation).width,
          height: getAnnotationTarget(annotation).height,
        }}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4" }}
      />
    </world-object>
  );
}

// export function AnnotationPage({ item, canvas }: { item: any; canvas: string }) {
//   console.log(item);
//   const vault = useVault();
//   const annoPage = vault.get(item) as any;
//   // console.log(annoPage);
//   // const annotationList = annoPage.annotations.map((anno: any) => vault.get(anno));
//   const annoList = useAnnotationList();
//   console.log(annoList);

//   return (
//     <world>
//       {/* {annotationList.map((annotation: any, index: number) => {
//         console.log(annotation);
//         return <Annotation anno={annotation} />;
//       })} */}
//     </world>
//   );
// }
