import { addMapping, importEntities } from "@iiif/vault/actions";
import { useContext, useState } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { InformationLink } from "../../atoms/InformationLink";
import { MediaResouceEditorModal } from "../ModalForms/MediaResource";
import { MediaResourcePreview } from "./MediaResourcePreview";

var uuid = require("uuid");

export const PaintingAnnotationsForm: React.FC = () => {
  const canvas = useCanvas();
  const vault = useVault();
  const shellContext = useContext(ShellContext);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<number | boolean>(false);

  const editImage = (newUrl: string) => {
    // Handle updating the image
  };

  const addNew = () => {
    // set the selected resource to false so we know we're editing a new one.
    setSelected(false);
    // bring up the media resource input form
    // setShowModal(true);
    const newID = `vault://${uuid.v4()}`;
    const nestedID = `vault://${uuid.v4()}`;
    if (!canvas) return;

    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            "https://www.nasa.gov/sites/default/files/images/628035main_as09-20-3064_full.jpg":
              {
                id: "https://www.nasa.gov/sites/default/files/images/628035main_as09-20-3064_full.jpg",
                type: "Image",
              },
          },
        },
      })
    );

    vault.dispatch(
      importEntities({
        entities: {
          Annotation: {
            [nestedID]: {
              id: "https://www.nasa.gov/sites/default/files/images/628035main_as09-20-3064_full.jpg",
              type: "Annotation",
              body: vault.get(
                "https://www.nasa.gov/sites/default/files/images/628035main_as09-20-3064_full.jpg"
              ),
              target: vault.get(canvas),
            },
          },
        },
      })
    );

    vault.dispatch(
      addMapping({
        id: nestedID,
        type: "ContentResource",
      })
    );
    vault.dispatch(
      importEntities({
        entities: {
          AnnotationPage: {
            [newID]: {
              id: newID,
              type: "AnnotationPage",
              behavior: [],
              motivation: null,
              label: null,
              thumbnail: [],
              summary: null,
              requiredStatement: null,
              metadata: [],
              rights: null,
              provider: [],
              items: [
                {
                  id: nestedID,
                  type: "Annotation",
                },
              ],
              seeAlso: [],
              homepage: [],
              logo: [],
              rendering: [],
              service: [],
            },
          },
        },
      })
    );
    vault.dispatch(
      addMapping({
        id: newID,
        type: "ContentResource",
      })
    );

    console.log(
      vault.get({
        id: "https://www.nasa.gov/sites/default/files/images/628035main_as09-20-3064_full.jpg",
      })
    );

    // And finally tell the vault to update which references are associated with the parent property
    const newMediaItem = canvas && canvas.items ? [...canvas.items] : [];
    if (canvas) {
      newMediaItem.push({
        id: newID,
        type: "AnnotationPage",
      });
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "items", newMediaItem);
    }
  };

  return (
    <div>
      <pre
        // @ts-ignore
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vault.get(canvas.items), null, 2),
        }}
      ></pre>
      {showModal && (
        <MediaResouceEditorModal close={() => setShowModal(false)} />
      )}
      <EmptyProperty label={"items"} createNew={addNew} />
      {vault &&
        // @ts-ignore
        vault.get(canvas.items).map((item: any) => {
          // console.log("ITEM", vault.get(item));
          const items = vault.get(item?.id);
          return (
            items &&
            item.items.map((NESTEDITEM: any, index: number) => {
              return (
                <MediaResourcePreview
                  changeImageSrc={(newimage: string) => {
                    setSelected(index);
                    editImage(newimage);
                  }}
                  thumbnailSrc={NESTEDITEM.id}
                />
              );
            })
          );
        })}
      <InformationLink
        guidanceReference={
          "https://iiif.io/api/presentation/3.0/#55-annotation-page "
        }
      />
    </div>
  );
};
