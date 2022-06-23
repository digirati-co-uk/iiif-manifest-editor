import { DrawBox, RegionHighlight, ResizeWorldItem, useControlledAnnotationList } from "@atlas-viewer/atlas";
import { useVault } from "react-iiif-vault";

export function Annotation({ props }: { props: any }) {}

export function AnnotationPage({ annotationList }: { annotationList: any }) {
  // const vault = useVault();
  // const annoPage = vault.get(annotationPage) as any;
  // const annotationList = annoPage.items.map((anno: any) => vault.get(anno));

  const formattedAnnotationList = annotationList.map((anno: any) => getAnnotationTarget(anno)) as FormattedAnnotation[];
  const {
    isEditing,
    onDeselect,
    selectedAnnotation,
    onCreateNewAnnotation,
    annotations,
    onUpdateAnnotation,
    setIsEditing,
    setSelectedAnnotation,
    editAnnotation,
    addNewAnnotation,
  } = useControlledAnnotationList(formattedAnnotationList);

  return (
    <world
    // onClick={onDeselect}
    >
      {annotations.map((item: any, index: number) => {
        // const target = annotation.target.split("#xywh=")[1];
        // const split = target.split(",").map((position: string) => parseInt(position));
        // console.log(item);
        return (
          // {(isEditing && !selectedAnnotation) ? <DrawBox onCreate={onCreateNewAnnotation} /> : null}
          <RegionHighlight
            id={item.id}
            key={item.id}
            region={item}
            // type={"box-selector"}
            // x={0}
            // y={0}
            // width={1000}
            // height={2000}
            // resizable={true}
            onSave={onUpdateAnnotation}
            style={{ background: "rgba(50, 0, 200, 0.4)" }}
            // isEditing={false}
            // onClick={() => {}}
            isEditing={selectedAnnotation === item.id}
            onClick={(anno: any) => {
              console.log("click annotation");
              setIsEditing(true);
              setSelectedAnnotation(anno.id);
            }}
          >
            {/* <box
              interactive
              html
              id={`${item.id}/box`}
              relativeStyle
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // onClick(region);
                console.table(e);
              }}
              style={{ background: "rgba(50, 0, 200, 0.2)" }}
              target={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            /> */}
          </RegionHighlight>
        );
      })}
    </world>
  );
}
