import { IIIFBuilder } from "iiif-builder";
import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../../hooks/useManifest";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../../apps/Shell/ShellContext";
import { CalltoButton } from "../../atoms/Button";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { InformationLink } from "../../atoms/InformationLink";
import { FlexContainer } from "../../layout/FlexContainer";
import { AnnotationPreview } from "./AnnotationPreview";
import { MediaResourcePreview } from "./MediaResourcePreview";

var uuid = require("uuid");

export const AnnotationForm = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();
  console.log(canvas && vault.get(canvas.annotations));

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";

  const addNew = () => {
    const newID = `vault://${uuid.v4()}`;

    if (!canvas || !manifest) return;
    const builder = new IIIFBuilder(vault);
    builder.editManifest(manifest.id, (mani: any) => {
      mani.editCanvas(canvas.id, (can: any) => {
        can.createAnnotation(canvas.id, {
          id: `${newID}/annotation-page`,
          type: "AnnotationPage",
          motivation: "describing",
          body: {
            id: uuid.v4(),
            type: "TextualBody",
            format: "text/html",
            height: 500,
            width: 500,
          },
        });
      });
    });
  };
  return (
    <>
      <EmptyProperty label={"annotations"} createNew={addNew} />
      <div>
        <FlexContainer>
          <h4>annotations</h4>
          {guidanceReference && (
            <InformationLink guidanceReference={guidanceReference} />
          )}
        </FlexContainer>
        <pre
          // @ts-ignore
          dangerouslySetInnerHTML={{
            // @ts-ignore
            __html: JSON.stringify(vault.get(canvas?.annotations), null, 3),
          }}
        ></pre>
      </div>
      {/* <h4>{vault.get(canvas.annotations)[0].items.length}</h4> */}
      {vault &&
        canvas &&
        // @ts-ignore
        vault.get(canvas.annotations).map((item: any) => {
          // @ts-ignore
          console.log(item);
          // @ts-ignore
          return vault.get(item.id)?.items.map((NESTEDITEM: any) => {
            // console.log(NESTEDITEM);
            return <AnnotationPreview thumbnailSrc={NESTEDITEM.id} />;
          });
        })}
    </>
  );
};
