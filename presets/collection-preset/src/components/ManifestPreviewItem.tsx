import { ManifestIcon, Modal } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { useEditingResource, useGenericEditor, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { useCallback, useState } from "react";
import { LocaleString, useManifest, useThumbnail } from "react-iiif-vault";
import { PreviewManifestInBrowser } from "./PreviewManifestInBrowser";

export function ManifestPreviewItem() {
  const [open, setOpen] = useState(false);
  const manifest = useManifest();
  const thumbnail = useThumbnail({ width: 256, height: 256 });
  const { edit } = useLayoutActions();
  const creator = useInlineCreator();
  const editor = useGenericEditor(manifest);
  const manifestInStack = useEditingResource();
  const isSelected = manifestInStack?.resource.source?.id === manifest?.id;

  const rawThumb = editor.descriptive.thumbnail.get();

  const setThumbnail = useCallback(
    (newThumbnail: any) => {
      editor.descriptive.thumbnail.deleteAtIndex(0);
      creator.create("@manifest-editor/image-url-creator", newThumbnail, {
        targetType: "ContentResource",
        parent: {
          property: "thumbnail",
          resource: {
            id: manifest!.id,
            type: "Manifest",
          },
        },
        initialData: {},
      });
      setOpen(false);
      edit(manifest!);
    },
    [creator, edit, editor, manifest],
  );

  return (
    <div
      data-selected={isSelected || undefined}
      className="bg-white p-2 relative data-[selected]:ring-2 ring-me-gray-500 data-[selected]:ring-me-primary-500 hover:ring-2 rounded"
      onClick={() => edit(manifest!)}
    >
      <div className="aspect-square bg-gray-100 mb-2 relative rounded-sm overflow-hidden">
        {thumbnail && rawThumb.length ? (
          <img className="w-full h-full object-contain" src={thumbnail.id} alt="Manifest Thumbnail" />
        ) : (
          <div className="w-full h-full flex items-center text-center justify-center text-gray-600">No thumbnail</div>
        )}
      </div>
      <LocaleString className="line-clamp-2 text-sm" as="h4">
        {manifest?.label}
      </LocaleString>

      <LocaleString className="line-clamp-2 mt-2 text-xs text-gray-600" as="p">
        {manifest?.summary}
      </LocaleString>

      <Button className="absolute top-0 right-0 flex items-center gap-1" onClick={() => setOpen(true)}>
        <ManifestIcon className="text-lg" /> Open preview
      </Button>
      <Modal title="Preview Manifest" open={open} onClose={() => setOpen(false)}>
        {manifest && open ? <PreviewManifestInBrowser id={manifest.id} setThumbnail={setThumbnail} /> : null}
      </Modal>
    </div>
  );
}
