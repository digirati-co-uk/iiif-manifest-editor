import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../../apps/Shell/ShellContext";
import { CalltoButton } from "../../atoms/Button";
import { InformationLink } from "../../atoms/InformationLink";
import { AnnotationPreview } from "./AnnotationPreview";
import { MediaResourcePreview } from "./MediaResourcePreview";

export const AnnotationForm = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();
  console.log(canvas && vault.get(canvas.annotations));

  const dispatchType = "annotations";
  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";
  return (
    <>
      <div>
        THE CANVAS ANNOTATIONS
        <pre
          // @ts-ignore
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(vault.get(canvas.annotations), null, 3),
          }}
        ></pre>
      </div>
      {vault &&
        canvas &&
        // @ts-ignore
        vault.get(canvas.annotations).map((item: any) => {
          // @ts-ignore
          console.log(item);
          return vault.get(item.id).items.map((NESTEDITEM: any) => {
            // console.log(NESTEDITEM);
            return <AnnotationPreview thumbnailSrc={NESTEDITEM.id} />;
          });
        })}
      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
      <CalltoButton onClick={() => {}} aria-label="new annotation property">
        Add new annotation
      </CalltoButton>
    </>
  );
};
