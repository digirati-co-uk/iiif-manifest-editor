import { LazyThumbnail, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useCreator, useManifestEditor } from "@manifest-editor/shell";
import { CanvasContext, useCanvas } from "react-iiif-vault";
import { getClassName } from "../helpers";

export const id = 'layout-test';

export const label = 'Layout test';

export const icon = <>🏁</>;

export const render = () => <LayoutTest />;


function LayoutTest() {
  const manifest = useManifestEditor();
  const manifestId = manifest.technical.id.get();
  const manifestRef = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifestRef, "items", "Canvas");

  const items = manifest.structural.items.get();

  return (
    <Sidebar>
      <SidebarHeader title="Layout test" />

      <SidebarContent>
        <div className="grid auto-rows-auto grid-cols-12 content-center justify-center gap-1 p-2" style={{ transition: '300ms' }}>
          <div className="col-span-4 row-span-4 text-black bg-[yellow] min-h-[100px]">TITLE</div>
          {items.map((item, idx) => (
            <CanvasContext key={item.id} canvas={item.id}>
              <SingleCanvas isFirst={idx === 0} onClick={() => canvasActions.edit(item)} />
            </CanvasContext>
          ))}
        </div>
      </SidebarContent>

    </Sidebar>
  );
}


function SingleCanvas({ isFirst, onClick }: { isFirst: boolean; onClick: () => void }) {
  const canvas = useCanvas();
  const behavior = canvas?.behavior || [];
  const className = getClassName(canvas?.behavior, isFirst);
  const isLeft = behavior.includes("left");
  const isRight = behavior.includes("right");
  const isBottom = behavior.includes("bottom");
  const isTop = behavior.includes("top");
  const isInfo = behavior.includes("info");
  const isImage = behavior.includes("image") || (!isInfo && !isLeft && !isRight && !isBottom && !isTop);

  let children = null;
  if (isInfo) {
    children = <div className="bg-black w-full h-full text-white">TEXT</div>
  } else {
    children = <div className={`flex h-full max-h-full min-h-0 ${isBottom ? 'flex-col' : 'flex-row'} ${isLeft ? 'flex-col-reverse' : ''}`}>
      <div className="flex-1 overflow-hidden relative justify-self-stretch">
        <div className="absolute inset-0">
          <LazyThumbnail cover />
        </div>
      </div>
      {isImage ? null : <div className={`${isBottom ? 'min-h-3 w-full' : 'w-1/3'} flex-shrink-0 self-stretch p-2 text-white bg-black rounded`}></div>}
    </div>
  }

  return <div onClick={onClick} className={`${className} bg-me-gray-700 overflow-hidden hover:ring-2 ring-me-primary-500`}>
    {children}
  </div>
}
