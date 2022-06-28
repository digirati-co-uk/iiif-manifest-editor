import { DrawBox, RegionHighlight, ResizeWorldItem, useControlledAnnotationList } from "@atlas-viewer/atlas";
import { useAnnotation, useVault } from "react-iiif-vault";
import { useAnnotationList } from "../../../../hooks/useAnnotationsList";

function getAnnotationTarget(annotation: any) {
  if (annotation.target) {
    return {
      id: annotation.id,
    };
  }
  const split = annotation.target.split("#xywh=")[1].split(",");
  return {
    id: annotation.id,
    height: parseInt(split[0]),
    width: parseInt(split[1]),
    x: parseInt(split[2]),
    y: parseInt(split[3]),
  };
}

export function Annotation({ anno }: { anno: any }) {
  // const annotation = useAnnotation(anno.id);
  // console.log("here", anno);
  return (
    <world-object
      x={0}
      y={0}
      width={getAnnotationTarget(anno).x}
      height={getAnnotationTarget(anno).y}
      // resizable={true}
      // onSave={() => {}}
    >
      <box
        interactive={true}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // onClick(region);
        }}
        target={{
          x: getAnnotationTarget(anno).x,
          y: getAnnotationTarget(anno).y,
          width: getAnnotationTarget(anno).width,
          height: getAnnotationTarget(anno).height,
        }}
        backgroundColor={"rgba(0, 0, 0, 0.4"}
      />
    </world-object>
  );
}

export function AnnotationPage({ item, canvas }: { item: any; canvas: string }) {
  console.log(item);
  const vault = useVault();
  const annoPage = vault.get(item) as any;
  // console.log(annoPage);
  // const annotationList = annoPage.annotations.map((anno: any) => vault.get(anno));
  const annoList = useAnnotationList();
  console.log(annoList);

  return (
    <world>
      {/* {annotationList.map((annotation: any, index: number) => {
        console.log(annotation);
        return <Annotation anno={annotation} />;
      })} */}
    </world>
  );
}
