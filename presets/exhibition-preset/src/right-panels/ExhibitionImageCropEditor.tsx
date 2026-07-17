import { ActionButton, Modal } from "@manifest-editor/components";
import { MediaEditor } from "@manifest-editor/editors";
import { type EditorDefinition, useEditor } from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AtlasStoreProvider,
  ImageService,
  RenderAnnotationEditing,
  useCanvas,
  useCurrentAnnotationActions,
  useRequestAnnotation,
  useVault,
} from "react-iiif-vault";
import {
  applyImageCropResponse,
  type CropRegion,
  type EditableImageCrop,
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
      if (response.cancelled || !response.boundingBox) {
        onClose();
        return;
      }
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
    >
      <div className="flex min-h-[24rem] flex-col p-4 sm:min-h-[32rem]">
        {error ? (
          <CropError message={error} />
        ) : dimensions && initialRegion && serviceId ? (
          <div className="relative min-h-[20rem] flex-1 overflow-hidden rounded border border-gray-200 bg-gray-950 sm:min-h-[28rem]">
            <AtlasStoreProvider name={`image-crop-${crop.annotationRef.id}`}>
              <ImageService
                src={serviceId}
                interactive
                fluid
                errorFallback={CropViewerError}
                homePosition={
                  {
                    x: 0,
                    y: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                  } as any
                }
                containerProps={{ className: "absolute inset-0" } as any}
              >
                <CropRegionRequest
                  bounds={{
                    x: 0,
                    y: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                  }}
                  initialRegion={initialRegion}
                  onResolve={resolveRequest}
                  onError={showRequestError}
                />
              </ImageService>
            </AtlasStoreProvider>
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

function CropRegionRequest({
  bounds,
  initialRegion,
  onResolve,
  onError,
}: {
  bounds: CropRegion;
  initialRegion: CropRegion;
  onResolve: (response: { cancelled?: boolean; boundingBox?: CropRegion | null }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const popup = useMemo(() => <CropRequestActions />, []);
  const { requestAnnotation, cancelRequest, requestId } = useRequestAnnotation();
  const requestRef = useRef(requestAnnotation);
  const cancelRef = useRef(cancelRequest);
  const resolveRef = useRef(onResolve);
  const errorRef = useRef(onError);
  requestRef.current = requestAnnotation;
  cancelRef.current = cancelRequest;
  resolveRef.current = onResolve;
  errorRef.current = onError;

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    requestRef
      .current({
        type: "box",
        bounds,
        selector: initialRegion,
        annotationPopup: popup,
      })
      .then((response) => {
        if (active && response) {
          return resolveRef.current(response);
        }
      })
      .catch((reason) => {
        if (active) errorRef.current(reason instanceof Error ? reason.message : "The crop editor could not be opened");
      });

    return () => {
      active = false;
      cancelRef.current();
    };
  }, [
    bounds.x,
    bounds.y,
    bounds.height,
    bounds.width,
    initialRegion.height,
    initialRegion.width,
    initialRegion.x,
    initialRegion.y,
    popup,
    requestId,
  ]);

  return <RenderAnnotationEditing />;
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

function CropViewerError() {
  return <CropError message="The image service could not render the full image." />;
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
