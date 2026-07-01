import { useCanvas } from "react-iiif-vault";
import "@atlas-viewer/atlas";
import { useGenericEditor } from "@manifest-editor/shell";
import { useCallback, useRef, useState } from "react";

export function ResizeCanvasOnCanvas() {
  const canvas = useCanvas();
  const editor = useGenericEditor(canvas);

  const [isHovered, setIsHovered] = useState(false);

  const hoverXBoxRef = useRef<any>(null);

  const width = canvas?.width || 0;
  const height = canvas?.height || 0;

  if (width === 0 || height === 0) return null;

  const resizerSize = 500;

  const handleClickX = useCallback(
    (e: any) => {
      const { x, y } = e.atlas;
      if (x < 0) {
        // resize left
        console.log("resize left", "width:", width, "->", Math.abs(x) + width);
        // Need to move ALL targets to the right, and then set the width.
      } else {
        // resize right
        console.log("resize right", "width:", width, "->", x);
        editor.technical.width.set(x);
      }
    },
    [canvas],
  );

  // @todo handleClickY

  const handleHoverLeft = useCallback((e: any) => {
    const { x, y } = e.atlas;
    hoverXBoxRef.current?.applyProps({
      target: { x: x + resizerSize, y: resizerSize, width: -x, height: height },
    });
  }, []);

  const handleHoverRight = useCallback((e: any) => {
    const { x, y } = e.atlas;
    hoverXBoxRef.current?.applyProps({
      target: { x: resizerSize + width, y: resizerSize, width: x - width, height: height },
    });
  }, []);

  const handleHoverTop = useCallback((e: any) => {
    const { x, y } = e.atlas;
    hoverXBoxRef.current?.applyProps({
      target: { x: resizerSize, y: y + resizerSize, width: width, height: -y },
    });
  }, []);

  const handleHoverBottom = useCallback((e: any) => {
    const { x, y } = e.atlas;

    const bottomDelta = y - (resizerSize + height);
    hoverXBoxRef.current?.applyProps({
      target: { x: resizerSize, y: resizerSize + height, width: width, height: resizerSize + bottomDelta },
    });
  }, []);

  return (
    <world-object x={-resizerSize} y={-resizerSize} width={width + resizerSize * 2} height={height + resizerSize * 2}>
      {isHovered && (
        <box
          ref={hoverXBoxRef}
          id="hover-x-box"
          target={{ x: 0, y: resizerSize, width: 2, height: height }}
          style={{ background: "rgba(255, 255, 255, .5)" }}
          relativeStyle
          interactive
        />
      )}

      <box
        //
        id="left-resizer"
        target={{ x: 0, y: resizerSize, width: resizerSize, height: height }}
        // style={{ outline: "2px solid #488afc" }}
        relativeStyle
        interactive
        onPointerMove={handleHoverLeft}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleClickX}
      />
      <box
        //
        id="right-resizer"
        target={{ x: resizerSize + width, y: resizerSize, width: resizerSize, height: height }}
        // style={{ outline: "2px solid #488afc" }}
        relativeStyle
        interactive
        onPointerMove={handleHoverRight}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleClickX}
      />

      <box
        //
        id="top-resizer"
        target={{ x: resizerSize, y: 0, width: width, height: resizerSize }}
        // style={{ outline: "2px solid #488afc" }}
        relativeStyle
        interactive
        onPointerMove={handleHoverTop}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      />

      <box
        //
        id="bottom-resizer"
        target={{ x: resizerSize, y: resizerSize + height, width: width, height: resizerSize }}
        // style={{ outline: "2px solid #488afc" }}
        relativeStyle
        interactive
        onPointerMove={handleHoverBottom}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      />
    </world-object>
  );
}
