import { ActionButton, Modal } from "@manifest-editor/components";
import { MediaEditor } from "@manifest-editor/editors";
import { type EditorDefinition, useEditor } from "@manifest-editor/shell";
import { Vault } from "@iiif/helpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AtlasStoreReactContext,
  CanvasPanel,
  useCanvas,
  useCurrentAnnotationActions,
  useRequestAnnotation,
  useVault,
  VaultProvider,
} from "react-iiif-vault";
import {
  applyImageCropResponse,
  type CropRegion,
  type EditableImageCrop,
  fullImageRequest,
  getImageCropContext,
  getServiceDimensions,
  parseCropRegion,
  resolveImageService,
} from "../image-crop";

export const exhibitionImageCropEditor: EditorDefinition = {
  id: "@exhibition/image-crop-editor",
  label: "Media",
  supports: {
    edit: true,
    sortKey: "annotation-target",
    properties: ["body"],
    resourceTypes: ["Annotation"],
    custom: ({ resource }, vault) => {
      const annotation = vault.get(resource, { skipSelfReturn: false } as any);
      return Boolean(annotation && getImageCropContext(annotation, (item) => resolveFromVault(vault, item)));
    },
  },
  component: () => <ExhibitionImageCropPanel />,
};

function ExhibitionImageCropPanel() {
  const vault = useVault();
  const editor = useEditor();
  const canvas = useCanvas({ id: editor.annotation.target.getSourceId() });
  const annotation = vault.get(editor.ref(), { skipSelfReturn: false } as any);
  const crop = annotation ? getImageCropContext(annotation, (item) => resolveFromVault(vault, item)) : null;
  const region = parseCropRegion(crop?.selector.region);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.querySelector("button")?.focus());
  };

  if (!crop || !canvas) return null;

  const cropSection = (
    <div className="flex flex-col gap-3">
      {region ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
          <dt className="font-semibold text-gray-700">Position</dt>
          <dd className="text-gray-600">
            {region.x}, {region.y}
          </dd>
          <dt className="font-semibold text-gray-700">Size</dt>
          <dd className="text-gray-600">
            {region.width} × {region.height}
          </dd>
          {crop.selector.rotation ? (
            <>
              <dt className="font-semibold text-gray-700">Rotation</dt>
              <dd className="text-gray-600">{crop.selector.rotation}°</dd>
            </>
          ) : null}
        </dl>
      ) : (
        <p className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          This image currently uses the full image. Create a crop to select a smaller visible region.
        </p>
      )}
      <span ref={triggerRef}>
        <ActionButton onPress={() => setOpen(true)}>{region ? "Edit crop" : "Create crop"}</ActionButton>
      </span>
    </div>
  );

  return (
    <>
      <MediaEditor
        additionalSections={[
          {
            label: "Image crop",
            initialOpen: Boolean(region),
            children: cropSection,
          },
        ]}
      />
      {open ? <ImageCropModal crop={crop} canvas={canvas} onClose={close} vault={vault} /> : null}
    </>
  );
}

function ImageCropModal({
  crop,
  canvas,
  vault,
  onClose,
}: {
  crop: EditableImageCrop;
  canvas: any;
  vault: any;
  onClose: () => void;
}) {
  const [service, setService] = useState<any>(() => (getServiceDimensions(crop.service) ? crop.service : null));
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    resolveImageService(crop.service)
      .then((resolved) => {
        if (active) setService(resolved);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load the image service");
      });
    return () => {
      active = false;
    };
  }, [crop.service]);

  const dimensions = getServiceDimensions(service);
  const initialRegion =
    parseCropRegion(crop.selector.region) ||
    (dimensions ? { x: 0, y: 0, width: dimensions.width, height: dimensions.height } : null);
  const serviceId = service?.id || service?.["@id"];

  const resolveRequest = useCallback(
    async (response: { cancelled?: boolean; boundingBox?: CropRegion | null }) => {
      if (response.cancelled || !response.boundingBox) return setEditing(false);
      setSaving(true);
      setError(null);
      try {
        applyImageCropResponse(vault, { ...crop, service }, canvas, response);
        onClose();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The crop could not be saved");
        setSaving(false);
      }
    },
    [canvas, crop, onClose, service, vault],
  );
  const showRequestError = useCallback((message: string) => setError(message), []);

  return (
    <Modal
      title={parseCropRegion(crop.selector.region) ? "Edit image crop" : "Create image crop"}
      onClose={onClose}
      className="max-w-5xl"
      height="80vh"
      disableAnimation
    >
      <div className="flex min-h-0 flex-1 flex-col p-4">
        {error ? (
          <CropError message={error} />
        ) : dimensions && initialRegion && serviceId ? (
          <div className="relative min-h-0 flex-1 overflow-hidden rounded border border-gray-200 bg-gray-950">
            <VirtualCropCanvas
              crop={crop}
              service={service}
              dimensions={dimensions}
              initialRegion={initialRegion}
              editing={editing}
              onEditingChange={setEditing}
              onResolve={resolveRequest}
              onError={showRequestError}
            />
            {saving ? (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/40 text-sm font-semibold text-white">
                Saving crop…
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid min-h-[20rem] flex-1 place-items-center text-sm text-gray-500">Loading full image…</div>
        )}
        <div className="mt-3 flex justify-end">
          <ActionButton onPress={onClose}>Cancel</ActionButton>
        </div>
      </div>
    </Modal>
  );
}

function VirtualCropCanvas({
  crop,
  service,
  dimensions,
  initialRegion,
  editing,
  onEditingChange,
  onResolve,
  onError,
}: {
  crop: EditableImageCrop;
  service: any;
  dimensions: { width: number; height: number };
  initialRegion: CropRegion;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onResolve: (response: { cancelled?: boolean; boundingBox?: CropRegion | null }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const virtualManifest = useMemo(
    () => createVirtualCropManifest(crop, service, dimensions),
    [crop.annotationRef.id, dimensions.height, dimensions.width, service],
  );
  const temporaryVault = useMemo(() => {
    const nextVault = new Vault();
    nextVault.loadManifestSync(virtualManifest.id, virtualManifest);
    return nextVault;
  }, [virtualManifest]);
  const viewerControls = useMemo(
    () =>
      function ViewerControls() {
        return (
          <CropViewerControls
            bounds={{ x: 0, y: 0, width: dimensions.width, height: dimensions.height }}
            initialRegion={initialRegion}
            onEditingChange={onEditingChange}
            onResolve={onResolve}
            onError={onError}
          />
        );
      },
    [
      dimensions.height,
      dimensions.width,
      initialRegion.height,
      initialRegion.width,
      initialRegion.x,
      initialRegion.y,
      onEditingChange,
      onError,
      onResolve,
    ],
  );

  return (
    <VaultProvider vault={temporaryVault}>
      <AtlasStoreReactContext.Provider value={null}>
        <CanvasPanel
          manifest={virtualManifest.id}
          startCanvas={virtualManifest.items[0]!.id}
          pagingEnabled={false}
          padding={0}
          components={{ ViewerControls: viewerControls }}
          annotations={editing ? null : <CropRegionPreview region={initialRegion} />}
        />
      </AtlasStoreReactContext.Provider>
    </VaultProvider>
  );
}

function createVirtualCropManifest(
  crop: EditableImageCrop,
  service: any,
  dimensions: { width: number; height: number },
) {
  const manifestId = `${crop.annotationRef.id}/crop-editor/manifest`;
  const canvasId = `${manifestId}/canvas`;
  const pageId = `${canvasId}/painting-page`;

  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestId,
    type: "Manifest",
    label: { en: ["Image crop editor"] },
    items: [
      {
        id: canvasId,
        type: "Canvas",
        width: dimensions.width,
        height: dimensions.height,
        items: [
          {
            id: pageId,
            type: "AnnotationPage",
            items: [
              {
                id: `${pageId}/painting`,
                type: "Annotation",
                motivation: "painting",
                target: canvasId,
                body: {
                  id: fullImageRequest(service),
                  type: "Image",
                  format: "image/jpeg",
                  width: dimensions.width,
                  height: dimensions.height,
                  service: [service],
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

function CropViewerControls({
  bounds,
  initialRegion,
  onEditingChange,
  onResolve,
  onError,
}: {
  bounds: CropRegion;
  initialRegion: CropRegion;
  onEditingChange: (editing: boolean) => void;
  onResolve: (response: { cancelled?: boolean; boundingBox?: CropRegion | null }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const popup = useMemo(() => <CropRequestActions />, []);
  const { requestAnnotation, cancelRequest, requestId, isActive, busy } = useRequestAnnotation();
  const cancelRef = useRef(cancelRequest);
  cancelRef.current = cancelRequest;

  useEffect(() => () => cancelRef.current(), []);

  const changeCrop = () => {
    onEditingChange(true);
    requestAnnotation({
      type: "box",
      bounds,
      selector: initialRegion,
      annotationPopup: popup,
    })
      .then((response) => {
        if (response) return onResolve(response);
        onEditingChange(false);
      })
      .catch((reason) => {
        onEditingChange(false);
        onError(reason instanceof Error ? reason.message : "The crop editor could not be opened");
      });
  };

  return isActive ? null : (
    <div className="absolute bottom-3 right-3 z-20 rounded bg-white p-2 shadow-lg">
      <ActionButton primary isDisabled={!requestId || busy} onPress={changeCrop}>
        Change crop
      </ActionButton>
    </div>
  );
}

function CropRegionPreview({ region }: { region: CropRegion }) {
  const Box = "box" as any;
  return (
    <Box
      html
      relativeStyle
      interactive={false}
      target={region}
      style={{
        backgroundColor: "rgba(14, 165, 233, 0.12)",
        borderColor: "#0ea5e9",
        borderWidth: 4,
      }}
    />
  );
}

function CropRequestActions() {
  const { saveAnnotation, cancelRequest } = useCurrentAnnotationActions();
  return (
    <div className="flex gap-2 rounded bg-white p-2 shadow-lg">
      <ActionButton onPress={() => cancelRequest()}>Discard</ActionButton>
      <ActionButton primary onPress={saveAnnotation}>
        Confirm
      </ActionButton>
    </div>
  );
}

function CropError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="grid min-h-[20rem] place-items-center rounded border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800"
    >
      <div>
        <div className="font-semibold">The full image could not be loaded</div>
        <div className="mt-1">{message}</div>
      </div>
    </div>
  );
}

function resolveFromVault(vault: any, resource: any) {
  if (!resource?.id) return resource;
  return (
    vault.get(resource, {
      preserveSpecificResources: true,
      skipSelfReturn: false,
    } as any) || resource
  );
}
