import { CollectionIcon, Modal } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { useEditingResource, useGenericEditor, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { useCallback, useState } from "react";
import { LocaleString, useCollection, useManifest, useThumbnail } from "react-iiif-vault";
import { PreviewManifestInBrowser } from "./PreviewManifestInBrowser";

export function CollectionPreviewItem() {
  const [open, setOpen] = useState(false);
  const collection = useCollection({} as any);
  const { edit } = useLayoutActions();
  const creator = useInlineCreator();
  const editor = useGenericEditor(collection);
  const collectionInstack = useEditingResource();
  const isSelected = collectionInstack?.resource.source?.id === collection?.id;

  const rawThumb = editor.descriptive.thumbnail.get();

  const setThumbnail = useCallback(
    (newThumbnail: any) => {
      editor.descriptive.thumbnail.deleteAtIndex(0);
      creator.create("@manifest-editor/image-url-creator", newThumbnail, {
        targetType: "ContentResource",
        parent: {
          property: "thumbnail",
          resource: {
            id: collection!.id,
            type: "Collection",
          },
        },
        initialData: {},
      });
      setOpen(false);
      edit(collection!);
    },
    [creator, edit, editor, collection],
  );

  return (
    <div
      data-selected={isSelected || undefined}
      className="bg-white p-2 relative data-[selected]:ring-2 ring-me-gray-500 data-[selected]:ring-me-primary-500 hover:ring-2 rounded"
      onClick={() => edit(collection!)}
    >
      <div className="aspect-square bg-gray-100 mb-2 relative rounded-sm overflow-hidden">
        {rawThumb.length ? (
          <img className="w-full h-full object-contain" src={rawThumb[0]!.id} alt="Collection Thumbnail" />
        ) : (
          <div className="w-full h-full flex items-center text-center justify-center text-gray-600">No thumbnail</div>
        )}
      </div>

      <LocaleString className="line-clamp-2 text-sm" as="h4">
        {collection?.label}
      </LocaleString>

      <LocaleString className="line-clamp-2 mt-2 text-xs text-gray-600" as="p">
        {collection?.summary}
      </LocaleString>

      <Button className="absolute top-0 right-0 flex gap-2 items-center" onClick={() => setOpen(true)}>
        <CollectionIcon className="text-lg" /> Open preview
      </Button>
      <Modal title="Preview Collection" open={open} onClose={() => setOpen(false)}>
        {collection && open ? <PreviewManifestInBrowser id={collection.id} setThumbnail={setThumbnail} /> : null}
      </Modal>
    </div>
  );
}
