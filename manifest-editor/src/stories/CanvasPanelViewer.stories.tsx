import {
  Runtime,
  useControlledAnnotationList,
  AtlasAuto,
  ImageService,
  DrawBox,
  RegionHighlight,
} from "@atlas-viewer/atlas";
import * as React from "react";
import { useRef, useState } from "react";

export default { title: "Manifest Editor/Annotations", component: DrawBox };

const staticTiles = [
  {
    id: "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2/info.json",
    width: 5233,
    height: 7200,
  },
  {
    id: "https://iiif.bodleian.ox.ac.uk/iiif/image/5009dea1-d1ae-435d-a43d-453e3bad283f/info.json",
    width: 4093,
    height: 2743,
  },
  {
    id: "https://iiif.ghentcdh.ugent.be/iiif/images/getuigenissen:brugse_vrije:RABrugge_I15_16999_V02:RABrugge_I15_16999_V02_01/info.json",
    width: 2677,
    height: 4117,
  },
  {
    id: "https://www.omeka.ugent.be/libraries.lw21/iiif-img/2/236",
    height: 1843,
    width: 1666,
  },
];

const sizes = [
  { width: 800, height: 600 },
  { width: 400, height: 300 },
  { width: 900, height: 600 },
  { width: 1000, height: 600 },
  { width: "100%", height: "100vh" },
];

export const SelectionDemo = () => {
  const runtime = useRef<Runtime>();

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
  } = useControlledAnnotationList([
    {
      id: "annotation-1",
      height: 100,
      width: 100,
      x: 500,
      y: 500,
    },
    {
      id: "annotation-2",
      height: 100,
      width: 100,
      x: 700,
      y: 700,
    },
    {
      id: "annotation-3",
      height: 100,
      width: 100,
      x: 900,
      y: 900,
    },
  ]);
  const [tileIndex, setTileIndex] = useState(1);
  const [isWebGL, setIsWebGL] = useState(false);
  const [size, setSize] = useState<any>({ width: 800, height: 600, idx: 0 });

  const goTo = (data: any) => {
    if (runtime.current) {
      runtime.current.world.gotoRegion(data);
    }
  };

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
  };

  return (
    <div>
      <div>
        <h3>Viewer</h3>
        <p>isEditing: {isEditing ? "true" : "false"}</p>
        <button
          onClick={() => {
            const idx = (size.idx + 1) % sizes.length;
            const newSize = sizes[idx];
            setSize({ width: newSize.width, height: newSize.height, idx });
          }}
        >
          Change size
        </button>
        <button onClick={() => setIsWebGL((e) => !e)}>Change renderer (current: {isWebGL ? "WebGL" : "canvas"})</button>
        <button onClick={() => setTileIndex((i) => (i + 1) % staticTiles.length)}>Change image</button>
        <div style={{ display: "flex" }}>
          <div style={{ flex: "1 1 0px" }}>
            <AtlasAuto
              unstable_webglRenderer={isWebGL}
              key={isWebGL ? "webgl" : "canvas"}
              // onCreated={(rt) => (runtime.current = rt.runtime)}
              mode={isEditing ? "sketch" : "explore"}
              // style={{ width: size.width + 200, height: size.height }}
            >
              <world onClick={onDeselect}>
                <ImageService key="wunder" {...staticTiles[tileIndex]} />
                {isEditing && !selectedAnnotation ? <DrawBox onCreate={onCreateNewAnnotation} /> : null}
                {annotations.map((annotation) => (
                  <RegionHighlight
                    key={annotation.id}
                    region={annotation}
                    isEditing={selectedAnnotation === annotation.id}
                    onSave={onUpdateAnnotation}
                    onClick={(anno) => {
                      console.log("click annotation");
                      setIsEditing(true);
                      setSelectedAnnotation(anno.id);
                    }}
                  />
                ))}
              </world>
            </AtlasAuto>
          </div>
          <div style={{ width: 300 }}>
            <button onClick={goHome}>Go home</button>
            <button onClick={zoomIn}>Zoom in</button>
            <button onClick={zoomOut}>Zoom out</button>
            {annotations.map((annotation) => (
              <div key={annotation.id}>
                {annotation.id} <button onClick={() => editAnnotation(annotation.id)}>edit</button>{" "}
                <button onClick={() => goTo(annotation)}>go to</button>
              </div>
            ))}
            <button onClick={addNewAnnotation}>Add new</button>
          </div>
        </div>
      </div>
    </div>
  );
};
