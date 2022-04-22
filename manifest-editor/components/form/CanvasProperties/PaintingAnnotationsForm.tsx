import { useCanvas, useVault } from "react-iiif-vault";
import { InformationLink } from "../../atoms/InformationLink";
import { MediaResourcePreview } from "./MediaResourcePreview";

export const PaintingAnnotationsForm: React.FC = () => {
  const canvas = useCanvas();
  const vault = useVault();
  return (
    <div>
      {/* <pre
        // @ts-ignore
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vault.get(canvas.items), null, 2),
        }}
      ></pre> */}
      {vault &&
        // @ts-ignore
        vault.get(canvas.items).map((item: any) => {
          // @ts-ignore
          return vault.get(item.id).items.map((NESTEDITEM: any) => {
            // console.log(NESTEDITEM);
            return <MediaResourcePreview thumbnailSrc={NESTEDITEM.id} />;
          });
        })}
      <InformationLink
        guidanceReference={
          "https://iiif.io/api/presentation/3.0/#55-annotation-page "
        }
      />
    </div>
  );
};
