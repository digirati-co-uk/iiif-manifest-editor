import {
  type BoxSelector,
  createPaintingAnnotationsHelper,
  expandTarget,
  getValue,
  type SupportedSelectors,
  type TemporalBoxSelector,
} from "@iiif/helpers";
import { addMappings, batchActions, importEntities, modifyEntityField } from "@iiif/helpers/vault/actions";
import {
  canonicalServiceUrl,
  createImageServiceRequest,
  imageServiceRequestToString,
  parseImageServiceRequest,
  type RegionParameter,
} from "@iiif/parser/image-3";
import type { ImageService } from "@iiif/presentation-3";
import { Modal } from "@manifest-editor/components";
import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTarget,
} from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";
import { CanvasContext, useThumbnail } from "react-iiif-vault";

export const BULK_THUMBNAIL_BUILDER_ACTION_ID = "@manifest-editor/manifest-preset/bulk-thumbnail-builder";

const configEventName = "manifest-preset:bulk-thumbnail-builder-config";
const resultsEventName = "manifest-preset:bulk-thumbnail-builder-results";
const standardSizes = [256, 384, 512, 768, 1024, 1536, 2048];

type MultiImageMode = "first" | "composite" | "layer";
type SizeChoiceSource = "configured" | "standard";
type ThumbnailTaskKind = "manifest" | "canvas";

type SizeChoice = {
  width: number;
  height?: number;
  label: string;
  source: SizeChoiceSource;
};

type BulkThumbnailBuilderRunOptions = {
  requestedWidth: number;
  multiImageMode: MultiImageMode;
  selectedLayerIndex: number;
  replaceExisting: boolean;
};

type ThumbnailPreviewCanvas = {
  id: string;
  label: string;
  hasThumbnail: boolean;
  paintingLayerCount: number;
};

type ThumbnailBuilderPreview = {
  manifestId: string;
  manifestHasThumbnail: boolean;
  manifestSourceCanvasId?: string;
  totalCanvases: number;
  missingCanvasThumbnails: number;
  multiImageCanvases: number;
  maxLayerCount: number;
  canvases: ThumbnailPreviewCanvas[];
};

type FirstServiceProbe = {
  status: "loaded" | "not-found" | "error";
  serviceId?: string;
  infoUrl?: string;
  message?: string;
  sizes: SizeChoice[];
};

type ThumbnailBuilderPlanData = {
  options: BulkThumbnailBuilderRunOptions;
  preview: ThumbnailBuilderPreview;
  sizeChoices: SizeChoice[];
  firstServiceProbe: FirstServiceProbe;
};

type ThumbnailTaskInput = {
  kind: ThumbnailTaskKind;
  targetId: string;
  targetType: "Manifest" | "Canvas";
  canvasId?: string;
};

type ThumbnailBuild = {
  id: string;
  width?: number;
  height?: number;
  format: string;
  usedConfiguredSize: boolean;
  verified: boolean;
  composite: boolean;
};

type ThumbnailLayer = {
  annotationId: string;
  label: string;
  resource: any;
  target: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sourceSelector?: SupportedSelectors | null;
};

type ThumbnailBuildResult = {
  total: number;
  added: number;
  skipped: number;
  failed: number;
  manifestAdded: boolean;
  canvasAdded: number;
  verified: number;
  usedConfiguredSizes: number;
  composites: number;
  changes: Array<{ targetId: string; targetType: string; thumbnailId: string; width?: number; height?: number }>;
  skippedTargets: Array<{ targetId: string; targetType: string; reason: string }>;
};

type BulkThumbnailBuilderConfigRequest = {
  actionId: string;
  preview: ThumbnailBuilderPreview;
  defaults: BulkThumbnailBuilderRunOptions;
  sizeChoices: SizeChoice[];
  firstServiceProbe: FirstServiceProbe;
  signal?: AbortSignal;
  resolve: (options: BulkThumbnailBuilderRunOptions | false) => void;
};

type BulkThumbnailBuilderDependencies = {
  requestConfig?: (
    ctx: BackgroundActionRunContext,
    preview: ThumbnailBuilderPreview,
    defaults: BulkThumbnailBuilderRunOptions,
    sizeChoices: SizeChoice[],
    firstServiceProbe: FirstServiceProbe,
  ) => Promise<BulkThumbnailBuilderRunOptions | false>;
};

type ServiceCacheEntry = {
  service: ImageService | null;
  sizes: Array<{ width: number; height?: number }>;
};

type ServiceCache = Map<string, Promise<ServiceCacheEntry>>;

type FirstServiceSource = {
  service?: ImageService;
  imageUrl?: string;
};

export function createBulkThumbnailBuilderBackgroundAction(
  dependencies: BulkThumbnailBuilderDependencies = {},
): BackgroundActionDefinition {
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;

  return {
    id: BULK_THUMBNAIL_BUILDER_ACTION_ID,
    label: "Bulk Thumbnail Builder",
    summary: "Generate missing manifest and canvas thumbnails from painting annotations",
    section: "Thumbnails",
    order: 10,
    resourceTypes: ["Manifest"],
    render: (ctx) => (
      <>
        {renderBulkThumbnailBuilderConfigModal(ctx.definition.id)}
        {renderBulkThumbnailBuilderResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) => openBulkThumbnailBuilderResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return manifest?.type === "Manifest";
    },
    prepare: async (ctx) => {
      ctx.setActionLabel("Preparing thumbnails");
      ctx.setActionStatus("preparing", "Scanning canvases");

      const preview = createThumbnailBuilderPreview(ctx);
      const firstServiceProbe = await loadFirstServiceProbe(ctx, preview);
      const sizeChoices = firstServiceProbe.sizes.length ? firstServiceProbe.sizes : createStandardSizeChoices();
      const defaults = normaliseRunOptions({
        requestedWidth: sizeChoices[0]?.width || 256,
        multiImageMode: preview.multiImageCanvases ? "first" : "first",
        selectedLayerIndex: 0,
        replaceExisting: false,
      });
      const options = await requestConfig(ctx, preview, defaults, sizeChoices, firstServiceProbe);

      if (options === false) {
        return false;
      }

      return createBulkThumbnailBuilderPlan(preview, options, sizeChoices, firstServiceProbe);
    },
    run: async (ctx) => {
      const planData = getPlanData(ctx.plan);
      const options = normaliseRunOptions(planData?.options || {});
      const result = createInitialResult(ctx.plan);
      const serviceCache: ServiceCache = new Map();

      ctx.setActionLabel("Building thumbnails");

      if (!ctx.plan?.tasks.length) {
        ctx.setActionStatus("running", "No thumbnail changes found");
        ctx.setActionProgress({ current: 0, total: 0, label: "No thumbnails" });
        return result;
      }

      ctx.canvasProgress.setStatuses(
        ctx.plan.tasks
          .map((task) => task.target)
          .filter((target): target is BackgroundActionTarget => !!target && target.type === "Canvas"),
        "queued",
      );

      await ctx.tasks.runEach(
        async (task) => {
          const input = task.input as ThumbnailTaskInput | undefined;
          if (!input) {
            result.skippedTargets.push({
              targetId: task.id,
              targetType: "Unknown",
              reason: "Missing thumbnail task input",
            });
            return skippedTask("Missing thumbnail task input");
          }

          const target = ctx.vault.get({ id: input.targetId, type: input.targetType } as any) as any;
          if (!target) {
            result.skippedTargets.push({
              targetId: input.targetId,
              targetType: input.targetType,
              reason: "Target resource no longer exists",
            });
            return skippedTask("Target missing");
          }

          if (hasThumbnail(target) && !options.replaceExisting) {
            result.skippedTargets.push({
              targetId: input.targetId,
              targetType: input.targetType,
              reason: "Thumbnail already exists",
            });
            return skippedTask("Already has thumbnail");
          }

          const canvas = getThumbnailSourceCanvas(ctx, input);
          if (!canvas) {
            result.skippedTargets.push({
              targetId: input.targetId,
              targetType: input.targetType,
              reason: "No source canvas with painting annotations found",
            });
            return skippedTask("No source canvas");
          }

          const thumbnail = await buildCanvasThumbnail(ctx, canvas, options, serviceCache);
          if (!thumbnail) {
            result.skippedTargets.push({
              targetId: input.targetId,
              targetType: input.targetType,
              reason: "No thumbnail image could be generated",
            });
            return skippedTask("No thumbnail image");
          }

          addThumbnailToResource(ctx, input, thumbnail);

          result.added += 1;
          if (input.kind === "manifest") {
            result.manifestAdded = true;
          } else {
            result.canvasAdded += 1;
          }
          if (thumbnail.verified) {
            result.verified += 1;
          }
          if (thumbnail.usedConfiguredSize) {
            result.usedConfiguredSizes += 1;
          }
          if (thumbnail.composite) {
            result.composites += 1;
          }
          result.changes.push({
            targetId: input.targetId,
            targetType: input.targetType,
            thumbnailId: thumbnail.id,
            width: thumbnail.width,
            height: thumbnail.height,
          });

          ctx.appendActionLog("Added thumbnail", "info", {
            targetId: input.targetId,
            targetType: input.targetType,
            thumbnailId: thumbnail.id,
          });

          return {
            result: {
              thumbnailId: thumbnail.id,
              width: thumbnail.width,
              height: thumbnail.height,
            },
            statusText: "Thumbnail added",
          };
        },
        {
          progressLabel: (_task, index, total) => `Building thumbnails ${index + 1}/${total}`,
        },
      );

      const tasks = ctx.tasks.getAll();
      result.failed = tasks.filter((task) => task.status === "error").length;
      result.skipped = tasks.filter((task) => task.status === "skipped").length;

      ctx.setActionStatus("running", `Added ${result.added}/${result.total} thumbnails`);
      ctx.setActionProgress({
        current: result.total,
        total: result.total,
        label: "Thumbnails complete",
      });

      return result;
    },
  };
}

function createBulkThumbnailBuilderPlan(
  preview: ThumbnailBuilderPreview,
  rawOptions: Partial<BulkThumbnailBuilderRunOptions>,
  sizeChoices: SizeChoice[],
  firstServiceProbe: FirstServiceProbe,
): BackgroundActionPlan {
  const options = normaliseRunOptions(rawOptions);
  const tasks: BackgroundActionPlan["tasks"] = [];

  if ((!preview.manifestHasThumbnail || options.replaceExisting) && preview.manifestSourceCanvasId) {
    tasks.push({
      id: `${preview.manifestId}#thumbnail`,
      label: "Manifest thumbnail",
      target: {
        id: preview.manifestId,
        type: "Manifest",
        label: "Manifest",
        scope: "root",
      },
      input: {
        kind: "manifest",
        targetId: preview.manifestId,
        targetType: "Manifest",
        canvasId: preview.manifestSourceCanvasId,
      } satisfies ThumbnailTaskInput,
      status: "queued",
    });
  }

  for (const canvas of preview.canvases) {
    if (canvas.hasThumbnail && !options.replaceExisting) {
      continue;
    }

    tasks.push({
      id: `${canvas.id}#thumbnail`,
      label: canvas.label || "Canvas thumbnail",
      target: {
        id: canvas.id,
        type: "Canvas",
        label: canvas.label || "Canvas",
        scope: "canvas",
      },
      input: {
        kind: "canvas",
        targetId: canvas.id,
        targetType: "Canvas",
        canvasId: canvas.id,
      } satisfies ThumbnailTaskInput,
      status: "queued",
    });
  }

  return {
    version: 1,
    data: { options, preview, sizeChoices, firstServiceProbe } satisfies ThumbnailBuilderPlanData,
    tasks,
  };
}

function createThumbnailBuilderPreview(ctx: BackgroundActionRunContext): ThumbnailBuilderPreview {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  const canvases = getManifestCanvases(ctx, manifest);
  const previewCanvases: ThumbnailPreviewCanvas[] = [];
  let missingCanvasThumbnails = 0;
  let multiImageCanvases = 0;
  let maxLayerCount = 0;
  let manifestSourceCanvasId: string | undefined;

  for (const canvas of canvases) {
    const layers = getCanvasPaintingLayers(ctx, canvas);
    const hasCanvasThumbnail = hasThumbnail(canvas);

    if (!hasCanvasThumbnail) {
      missingCanvasThumbnails += 1;
    }

    if (layers.length > 1) {
      multiImageCanvases += 1;
    }

    if (layers.length > maxLayerCount) {
      maxLayerCount = layers.length;
    }

    if (!manifestSourceCanvasId && layers.length) {
      manifestSourceCanvasId = canvas.id;
    }

    previewCanvases.push({
      id: canvas.id,
      label: getResourceLabel(canvas, "Canvas"),
      hasThumbnail: hasCanvasThumbnail,
      paintingLayerCount: layers.length,
    });
  }

  return {
    manifestId: manifest?.id || ctx.target.id,
    manifestHasThumbnail: hasThumbnail(manifest),
    manifestSourceCanvasId,
    totalCanvases: canvases.length,
    missingCanvasThumbnails,
    multiImageCanvases,
    maxLayerCount,
    canvases: previewCanvases,
  };
}

async function loadFirstServiceProbe(
  ctx: BackgroundActionRunContext,
  preview: ThumbnailBuilderPreview,
): Promise<FirstServiceProbe> {
  const firstSource = findFirstImageServiceSource(ctx, preview);
  const firstService = firstSource?.service;
  const imageUrl = firstSource?.imageUrl;

  if (!firstService && !imageUrl) {
    return {
      status: "not-found",
      message: "No IIIF image service found in the painting annotations.",
      sizes: [],
    };
  }

  const serviceId = firstService ? getServiceId(firstService) : "";
  if (firstService && !serviceId) {
    return {
      status: "error",
      message: "The first IIIF image service has no id.",
      sizes: createSizeChoicesFromService(firstService),
    };
  }

  const infoUrl = firstService ? getCanonicalServiceInfoUrl(serviceId) : getImageRequestInfoUrl(imageUrl || "");
  if (!infoUrl) {
    return {
      status: "error",
      message: "The first IIIF image service could not be resolved.",
      sizes: [],
    };
  }

  return loadFirstServiceInfo(ctx, infoUrl, serviceId || infoUrl.replace(/\/info\.json$/, ""), firstService);
}

async function loadFirstServiceInfo(
  ctx: BackgroundActionRunContext,
  infoUrl: string,
  fallbackId: string,
  fallbackService?: ImageService,
): Promise<FirstServiceProbe> {
  try {
    ctx.setActionStatus("preparing", "Loading first image service");
    const response = await fetch(infoUrl, { signal: ctx.signal });
    if (!response.ok) {
      return {
        status: "error",
        serviceId: fallbackId,
        infoUrl,
        message: `Unable to load info.json (${response.status}).`,
        sizes: fallbackService ? createSizeChoicesFromService(fallbackService) : [],
      };
    }

    const service = normaliseImageService(await response.json(), fallbackId);
    return {
      status: "loaded",
      serviceId: fallbackId,
      infoUrl,
      sizes: createSizeChoicesFromService(service),
    };
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return {
      status: "error",
      serviceId: fallbackId,
      infoUrl,
      message: error instanceof Error ? error.message : "Unable to load info.json.",
      sizes: fallbackService ? createSizeChoicesFromService(fallbackService) : [],
    };
  }
}

function findFirstImageServiceSource(
  ctx: BackgroundActionRunContext,
  preview: ThumbnailBuilderPreview,
): FirstServiceSource | null {
  for (const canvasPreview of preview.canvases) {
    const canvas = ctx.vault.get({ id: canvasPreview.id, type: "Canvas" } as any) as any;
    const layers = getCanvasPaintingLayers(ctx, canvas);

    for (const layer of layers) {
      const service = getImageServiceFromResource(ctx, layer.resource);
      if (service) {
        return { service };
      }

      if (getImageRequestInfoUrl(layer.resource?.id)) {
        return { imageUrl: layer.resource.id };
      }
    }
  }

  return null;
}

function getManifestCanvases(ctx: Pick<BackgroundActionRunContext, "vault">, manifest: any) {
  if (!manifest?.items?.length) {
    return [];
  }

  return (ctx.vault.get(manifest.items) as any[]).filter((item) => item?.type === "Canvas");
}

function getCanvasPaintingLayers(ctx: Pick<BackgroundActionRunContext, "vault">, canvas: any): ThumbnailLayer[] {
  if (!canvas) {
    return [];
  }

  const helper = createPaintingAnnotationsHelper(ctx.vault as any);
  const paintables = helper.getPaintables(canvas);
  const layers: ThumbnailLayer[] = [];

  for (const [index, item] of paintables.items.entries()) {
    if (item.type !== "image" || !item.resource) {
      continue;
    }

    const target = getTargetBox(item.target, canvas);
    if (!target) {
      continue;
    }

    layers.push({
      annotationId: item.annotationId,
      label: getResourceLabel(item.resource, `Layer ${index + 1}`),
      resource: item.resource,
      target,
      sourceSelector: item.selector || null,
    });
  }

  return layers;
}

async function buildCanvasThumbnail(
  ctx: BackgroundActionRunContext,
  canvas: any,
  options: BulkThumbnailBuilderRunOptions,
  serviceCache: ServiceCache,
): Promise<ThumbnailBuild | null> {
  const layers = getCanvasPaintingLayers(ctx, canvas);
  if (!layers.length) {
    return null;
  }

  if (layers.length > 1 && options.multiImageMode === "composite") {
    return buildCompositeThumbnail(ctx, canvas, layers, options.requestedWidth, serviceCache);
  }

  const selectedIndex = layers.length > 1 && options.multiImageMode === "layer" ? options.selectedLayerIndex : 0;
  const selectedLayer = layers[selectedIndex];
  if (!selectedLayer) {
    return null;
  }

  return buildLayerThumbnail(ctx, selectedLayer, options.requestedWidth, serviceCache);
}

async function buildLayerThumbnail(
  ctx: BackgroundActionRunContext,
  layer: ThumbnailLayer,
  requestedWidth: number,
  serviceCache: ServiceCache,
): Promise<ThumbnailBuild | null> {
  const candidate = await getLayerImageCandidate(ctx, layer, requestedWidth, serviceCache);
  if (!candidate) {
    return null;
  }

  return {
    id: candidate.id,
    width: candidate.width,
    height: candidate.height,
    format: candidate.format,
    usedConfiguredSize: candidate.usedConfiguredSize,
    verified: candidate.verified,
    composite: false,
  };
}

async function buildCompositeThumbnail(
  ctx: BackgroundActionRunContext,
  canvas: any,
  layers: ThumbnailLayer[],
  requestedWidth: number,
  serviceCache: ServiceCache,
): Promise<ThumbnailBuild | null> {
  if (typeof document === "undefined") {
    return null;
  }

  const outputSize = fitWithin(
    {
      width: canvas.width || requestedWidth,
      height: canvas.height || requestedWidth,
    },
    requestedWidth,
  );
  const canvasWidth = toPositiveNumber(canvas.width) || outputSize.width;
  const canvasHeight = toPositiveNumber(canvas.height) || outputSize.height;
  const canvasElement = document.createElement("canvas");
  canvasElement.width = outputSize.width;
  canvasElement.height = outputSize.height;

  const context = canvasElement.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "#fff";
  context.fillRect(0, 0, outputSize.width, outputSize.height);

  let painted = 0;
  let usedConfiguredSize = false;
  let verified = false;

  for (const layer of layers) {
    const targetWidth = Math.max(1, Math.round((layer.target.width / canvasWidth) * outputSize.width));
    const candidate = await getLayerImageCandidate(ctx, layer, targetWidth, serviceCache);
    if (!candidate) {
      continue;
    }

    const bitmap = await fetchImageBitmap(candidate.id, ctx.signal);
    if (!bitmap) {
      continue;
    }

    const drawRect = {
      x: (layer.target.x / canvasWidth) * outputSize.width,
      y: (layer.target.y / canvasHeight) * outputSize.height,
      width: (layer.target.width / canvasWidth) * outputSize.width,
      height: (layer.target.height / canvasHeight) * outputSize.height,
    };

    context.drawImage(bitmap, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
    bitmap.close?.();
    painted += 1;
    usedConfiguredSize = usedConfiguredSize || candidate.usedConfiguredSize;
    verified = true;
  }

  if (!painted) {
    return null;
  }

  return {
    id: canvasElement.toDataURL("image/jpeg", 0.86),
    width: outputSize.width,
    height: outputSize.height,
    format: "image/jpeg",
    usedConfiguredSize,
    verified,
    composite: true,
  };
}

async function getLayerImageCandidate(
  ctx: BackgroundActionRunContext,
  layer: ThumbnailLayer,
  requestedWidth: number,
  serviceCache: ServiceCache,
): Promise<{
  id: string;
  width?: number;
  height?: number;
  format: string;
  usedConfiguredSize: boolean;
  verified: boolean;
} | null> {
  const sourceRegion = selectorToRegion(layer.sourceSelector);
  const service = getImageServiceFromResource(ctx, layer.resource);
  const resolvedService = service
    ? await loadService(ctx, service, serviceCache)
    : await loadServiceFromImageUrl(ctx, layer.resource?.id, serviceCache);

  if (resolvedService?.service) {
    const size = sourceRegion ? null : chooseClosestSize(resolvedService.sizes, requestedWidth);

    if (size) {
      return {
        id: serviceImageAtSize(resolvedService.service, size, sourceRegion || { full: true }),
        width: size.width,
        height: size.height,
        format: "image/jpeg",
        usedConfiguredSize: true,
        verified: false,
      };
    }

    const customSize = {
      width: requestedWidth,
      height: undefined,
    };
    const id = serviceImageAtSize(resolvedService.service, customSize, sourceRegion || { full: true });
    const exists = await verifyImageExists(id, ctx.signal);
    if (!exists) {
      return null;
    }

    return {
      id,
      width: customSize.width,
      height: estimateHeight(layer.resource, resolvedService.service, sourceRegion, customSize.width),
      format: "image/jpeg",
      usedConfiguredSize: false,
      verified: true,
    };
  }

  if (typeof layer.resource?.id !== "string") {
    return null;
  }

  const exists = await verifyImageExists(layer.resource.id, ctx.signal);
  if (!exists) {
    return null;
  }

  return {
    id: layer.resource.id,
    width: toPositiveNumber(layer.resource.width),
    height: toPositiveNumber(layer.resource.height),
    format: typeof layer.resource.format === "string" ? layer.resource.format : "image/jpeg",
    usedConfiguredSize: false,
    verified: true,
  };
}

function getImageServiceFromResource(
  ctx: Pick<BackgroundActionRunContext, "vault">,
  resource: any,
): ImageService | null {
  const services = toArray(resource?.service)
    .map((service) => ctx.vault.get(service as any) || service)
    .filter(isImageServiceLike);

  return services[0] || null;
}

async function loadService(
  ctx: BackgroundActionRunContext,
  service: ImageService,
  serviceCache: ServiceCache,
): Promise<ServiceCacheEntry | null> {
  const serviceId = getServiceId(service);
  if (!serviceId) {
    const sizes = createRawSizesFromService(service);
    return { service, sizes };
  }

  const infoUrl = getCanonicalServiceInfoUrl(serviceId);
  const cached = serviceCache.get(infoUrl);
  if (cached) {
    return cached;
  }

  const promise = (async (): Promise<ServiceCacheEntry> => {
    const embeddedSizes = createRawSizesFromService(service);
    if (embeddedSizes.length) {
      return {
        service: normaliseImageService(service, serviceId),
        sizes: embeddedSizes,
      };
    }

    try {
      const response = await fetch(infoUrl, { signal: ctx.signal });
      if (!response.ok) {
        return {
          service: normaliseImageService(service, serviceId),
          sizes: embeddedSizes,
        };
      }

      const loadedService = normaliseImageService(await response.json(), serviceId);
      return {
        service: loadedService,
        sizes: createRawSizesFromService(loadedService),
      };
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      return {
        service: normaliseImageService(service, serviceId),
        sizes: embeddedSizes,
      };
    }
  })();

  serviceCache.set(infoUrl, promise);
  return promise;
}

async function loadServiceFromImageUrl(
  ctx: BackgroundActionRunContext,
  imageUrl: unknown,
  serviceCache: ServiceCache,
): Promise<ServiceCacheEntry | null> {
  if (typeof imageUrl !== "string") {
    return null;
  }

  const infoUrl = getImageRequestInfoUrl(imageUrl);
  if (!infoUrl) {
    return null;
  }

  const cached = serviceCache.get(infoUrl);
  if (cached) {
    return cached;
  }

  const promise = (async (): Promise<ServiceCacheEntry> => {
    try {
      const response = await fetch(infoUrl, { signal: ctx.signal });
      if (!response.ok) {
        return { service: null, sizes: [] };
      }

      const service = normaliseImageService(await response.json(), infoUrl.replace(/\/info\.json$/, ""));
      return {
        service,
        sizes: createRawSizesFromService(service),
      };
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      return { service: null, sizes: [] };
    }
  })();

  serviceCache.set(infoUrl, promise);
  return promise;
}

function serviceImageAtSize(service: ImageService, size: { width?: number; height?: number }, region: RegionParameter) {
  const request = createImageServiceRequest(service);
  return imageServiceRequestToString({
    identifier: request.identifier,
    server: request.server,
    scheme: request.scheme,
    type: "image",
    size: {
      max: !size.width && !size.height,
      confined: false,
      upscaled: false,
      width: size.width,
      height: size.height,
    },
    format: "jpg",
    region,
    rotation: { angle: 0 },
    quality: "default",
    prefix: request.prefix,
    originalPath: (request as any).originalPath,
  });
}

function addThumbnailToResource(ctx: BackgroundActionRunContext, input: ThumbnailTaskInput, thumbnail: ThumbnailBuild) {
  const resource = {
    id: thumbnail.id,
    type: "Image",
    format: thumbnail.format,
    width: thumbnail.width,
    height: thumbnail.height,
  };

  ctx.vault.dispatch(
    batchActions({
      actions: [
        importEntities({
          entities: {
            ContentResource: {
              [thumbnail.id]: resource,
            },
          },
        }),
        addMappings({
          mapping: {
            [thumbnail.id]: "ContentResource",
          },
        }),
        modifyEntityField({
          id: input.targetId,
          type: input.targetType,
          key: "thumbnail",
          value: [{ id: thumbnail.id, type: "ContentResource" }],
        }),
      ],
    }),
  );
}

function getThumbnailSourceCanvas(ctx: BackgroundActionRunContext, input: ThumbnailTaskInput) {
  if (input.canvasId) {
    const canvas = ctx.vault.get({ id: input.canvasId, type: "Canvas" } as any) as any;
    if (canvas && getCanvasPaintingLayers(ctx, canvas).length) {
      return canvas;
    }
  }

  const manifest = ctx.vault.get(ctx.target as any) as any;
  const canvases = getManifestCanvases(ctx, manifest);
  return canvases.find((canvas) => getCanvasPaintingLayers(ctx, canvas).length) || null;
}

function getTargetBox(target: any, canvas: any) {
  const fallback = {
    x: 0,
    y: 0,
    width: toPositiveNumber(canvas?.width) || 1,
    height: toPositiveNumber(canvas?.height) || 1,
  };

  try {
    const expanded = expandTarget(target);
    const selector = expanded.selector;
    if (selector?.type === "BoxSelector" || selector?.type === "TemporalBoxSelector") {
      return normaliseSelectorBox(selector, fallback);
    }
  } catch {
    // Fallback below handles whole-canvas targets.
  }

  return fallback;
}

function normaliseSelectorBox(
  selector: BoxSelector | TemporalBoxSelector,
  canvasBox: { x: number; y: number; width: number; height: number },
) {
  const spatial = selector.spatial;
  if (spatial.unit === "percent") {
    return {
      x: (spatial.x / 100) * canvasBox.width,
      y: (spatial.y / 100) * canvasBox.height,
      width: (spatial.width / 100) * canvasBox.width,
      height: (spatial.height / 100) * canvasBox.height,
    };
  }

  return {
    x: spatial.x,
    y: spatial.y,
    width: spatial.width,
    height: spatial.height,
  };
}

function selectorToRegion(selector: SupportedSelectors | null | undefined): RegionParameter | null {
  if (!selector || (selector.type !== "BoxSelector" && selector.type !== "TemporalBoxSelector")) {
    return null;
  }

  const spatial = selector.spatial;
  return {
    x: spatial.x,
    y: spatial.y,
    w: spatial.width,
    h: spatial.height,
    percent: spatial.unit === "percent",
  };
}

function fitWithin(input: { width: number; height: number }, maxSize: number) {
  const ratio = input.width > input.height ? maxSize / input.width : maxSize / input.height;
  return {
    width: Math.max(1, Math.round(input.width * ratio)),
    height: Math.max(1, Math.round(input.height * ratio)),
  };
}

async function verifyImageExists(url: string, signal: AbortSignal) {
  try {
    const response = await fetch(url, { signal });
    response.body?.cancel().catch(() => undefined);
    return response.ok;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return false;
  }
}

async function fetchImageBitmap(url: string, signal: AbortSignal) {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return createImageBitmap(blob);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return null;
  }
}

function createInitialResult(plan: BackgroundActionPlan | undefined): ThumbnailBuildResult {
  return {
    total: plan?.tasks.length || 0,
    added: 0,
    skipped: 0,
    failed: 0,
    manifestAdded: false,
    canvasAdded: 0,
    verified: 0,
    usedConfiguredSizes: 0,
    composites: 0,
    changes: [],
    skippedTargets: [],
  };
}

function skippedTask(reason: string) {
  return {
    taskStatus: "skipped" as const,
    result: { reason },
    statusText: reason,
  };
}

function hasThumbnail(resource: any) {
  return Array.isArray(resource?.thumbnail) && resource.thumbnail.length > 0;
}

function getResourceLabel(resource: any, fallback: string) {
  return getValue(resource?.label, { defaultText: fallback }) || fallback;
}

function createStandardSizeChoices(): SizeChoice[] {
  return standardSizes.map((width) => ({
    width,
    label: `${width}px`,
    source: "standard",
  }));
}

function createSizeChoicesFromService(service: ImageService): SizeChoice[] {
  return createRawSizesFromService(service).map((size) => ({
    ...size,
    label: size.height ? `${size.width} x ${size.height}` : `${size.width}px`,
    source: "configured",
  }));
}

function createRawSizesFromService(service: any): Array<{ width: number; height?: number }> {
  const serviceWidth = toPositiveNumber(service?.width);
  const serviceHeight = toPositiveNumber(service?.height);

  const sizes: Array<{ width: number; height?: number }> = [];

  for (const size of toArray(service?.sizes)) {
    const width = toPositiveNumber(size?.width);
    const height =
      toPositiveNumber(size?.height) ||
      (width && serviceWidth && serviceHeight ? Math.round((width / serviceWidth) * serviceHeight) : undefined);

    if (width) {
      sizes.push({ width, height });
    }
  }

  return sizes.sort((a, b) => a.width - b.width);
}

function chooseClosestSize(sizes: Array<{ width: number; height?: number }>, requestedWidth: number) {
  let best: { width: number; height?: number } | null = null;

  for (const size of sizes) {
    if (!best || Math.abs(size.width - requestedWidth) < Math.abs(best.width - requestedWidth)) {
      best = size;
    }
  }

  return best;
}

function estimateHeight(resource: any, service: ImageService, region: RegionParameter | null, width: number) {
  if (region?.w && region?.h) {
    return Math.round((width / region.w) * region.h);
  }

  const sourceWidth = toPositiveNumber(service.width) || toPositiveNumber(resource?.width);
  const sourceHeight = toPositiveNumber(service.height) || toPositiveNumber(resource?.height);

  if (!sourceWidth || !sourceHeight) {
    return undefined;
  }

  return Math.round((width / sourceWidth) * sourceHeight);
}

function normaliseImageService(service: any, fallbackId: string): ImageService {
  const next = { ...service };
  next.id = next.id || next["@id"] || fallbackId;
  next.type = next.type || next["@type"] || "ImageService3";
  return next;
}

function getServiceId(service: any) {
  const id = service?.id || service?.["@id"];
  return typeof id === "string" ? id : "";
}

function getCanonicalServiceInfoUrl(serviceId: string) {
  try {
    if (serviceId.endsWith("default.jpg") || serviceId.endsWith("default.png")) {
      return imageServiceRequestToString({
        ...parseImageServiceRequest(serviceId),
        type: "info",
      });
    }
  } catch {
    // Fall through to canonicalServiceUrl.
  }

  return canonicalServiceUrl(serviceId);
}

function getImageRequestInfoUrl(imageUrl: unknown) {
  if (typeof imageUrl !== "string") {
    return "";
  }

  try {
    const request = parseImageServiceRequest(imageUrl);
    if (request.type !== "image") {
      return "";
    }
    return imageServiceRequestToString({ ...request, type: "info" });
  } catch {
    return "";
  }
}

function isImageServiceLike(service: any): service is ImageService {
  if (!service || typeof service !== "object") {
    return false;
  }

  const type = service.type || service["@type"];
  return (
    String(type || "").startsWith("ImageService") ||
    service.protocol === "http://iiif.io/api/image" ||
    Array.isArray(service.sizes) ||
    Array.isArray(service.tiles)
  );
}

function normaliseRunOptions(options: Partial<BulkThumbnailBuilderRunOptions>): BulkThumbnailBuilderRunOptions {
  const requestedWidth = toPositiveNumber(options.requestedWidth) || 256;
  const selectedLayerIndex = Math.max(0, Math.floor(toPositiveNumber(options.selectedLayerIndex) || 0));
  const multiImageMode =
    options.multiImageMode === "composite" || options.multiImageMode === "layer" ? options.multiImageMode : "first";

  return {
    requestedWidth,
    multiImageMode,
    selectedLayerIndex,
    replaceExisting: options.replaceExisting === true,
  };
}

function getPlanData(plan: BackgroundActionPlan | undefined): ThumbnailBuilderPlanData | null {
  if (!plan?.data || typeof plan.data !== "object") {
    return null;
  }

  return plan.data as ThumbnailBuilderPlanData;
}

function toPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function isAbortError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"));
}

function defaultRequestConfig(
  ctx: BackgroundActionRunContext,
  preview: ThumbnailBuilderPreview,
  defaults: BulkThumbnailBuilderRunOptions,
  sizeChoices: SizeChoice[],
  firstServiceProbe: FirstServiceProbe,
) {
  return requestBulkThumbnailBuilderConfig({
    actionId: ctx.definition.id,
    preview,
    defaults,
    sizeChoices,
    firstServiceProbe,
    signal: ctx.signal,
  });
}

function requestBulkThumbnailBuilderConfig(
  request: Omit<BulkThumbnailBuilderConfigRequest, "resolve">,
): Promise<BulkThumbnailBuilderRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted || typeof window === "undefined") {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: BulkThumbnailBuilderRunOptions | false) => {
      if (settled) {
        return;
      }

      settled = true;
      request.signal?.removeEventListener("abort", handleAbort);
      resolve(options);
    };
    const handleAbort = () => settle(false);

    request.signal?.addEventListener("abort", handleAbort, { once: true });
    window.dispatchEvent(
      new CustomEvent<BulkThumbnailBuilderConfigRequest>(configEventName, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

function renderBulkThumbnailBuilderConfigModal(actionId: string) {
  return <BulkThumbnailBuilderConfigModal actionId={actionId} />;
}

function BulkThumbnailBuilderConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<BulkThumbnailBuilderConfigRequest | null>(null);
  const [options, setOptions] = useState<BulkThumbnailBuilderRunOptions>(normaliseRunOptions({}));

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<BulkThumbnailBuilderConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseRunOptions(detail.defaults));
      }
    };

    window.addEventListener(configEventName, listener);
    return () => window.removeEventListener(configEventName, listener);
  }, [actionId]);

  useEffect(() => {
    if (!request?.signal) {
      return;
    }

    if (request.signal.aborted) {
      setRequest(null);
      return;
    }

    const handleAbort = () => setRequest(null);
    request.signal.addEventListener("abort", handleAbort, { once: true });
    return () => request.signal?.removeEventListener("abort", handleAbort);
  }, [request]);

  const selectedSize = useMemo(
    () => request?.sizeChoices.find((choice) => choice.width === options.requestedWidth),
    [request?.sizeChoices, options.requestedWidth],
  );

  if (!request) {
    return null;
  }

  const manifestThumbnailCount =
    (!request.preview.manifestHasThumbnail || options.replaceExisting) && request.preview.manifestSourceCanvasId
      ? 1
      : 0;
  const canvasThumbnailCount = options.replaceExisting
    ? request.preview.totalCanvases
    : request.preview.missingCanvasThumbnails;
  const thumbnailCount = manifestThumbnailCount + canvasThumbnailCount;

  const close = (value: BulkThumbnailBuilderRunOptions | false) => {
    request.resolve(value === false ? false : normaliseRunOptions(value));
    setRequest(null);
  };

  const hasMultiImage = request.preview.multiImageCanvases > 0;

  return (
    <Modal
      title="Bulk Thumbnail Builder"
      onClose={() => close(false)}
      className="max-w-4xl"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">
            {thumbnailCount === 0
              ? "All thumbnails up to date"
              : `${thumbnailCount} thumbnail${thumbnailCount === 1 ? "" : "s"} to ${options.replaceExisting ? "add or replace" : "add"}`}
          </span>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={() => close(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-me-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-me-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={thumbnailCount === 0}
            onClick={() => close(options)}
          >
            Build thumbnails
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-[220px_minmax(0,1fr)] h-[58vh]">
        {/* Left: Options */}
        <div className="flex flex-col gap-4 overflow-y-auto border-r border-zinc-100 p-5 text-sm text-zinc-700">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {request.preview.totalCanvases} canvas{request.preview.totalCanvases === 1 ? "" : "es"}
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 leading-relaxed">
              {selectedSize?.source === "configured" ? (
                <>Sizes from image service · <span className="font-mono text-zinc-700">{selectedSize.width}px</span></>
              ) : (
                "Using standard sizes — no image service detected"
              )}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Thumbnail size</span>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-me-primary-500 focus:outline-none"
              value={options.requestedWidth}
              onChange={(event) =>
                setOptions((current) => ({ ...current, requestedWidth: Number(event.target.value) }))
              }
            >
              {request.sizeChoices.map((choice) => (
                <option key={`${choice.source}-${choice.width}-${choice.height || 0}`} value={choice.width}>
                  {choice.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 hover:bg-zinc-100">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-me-primary-500 focus:ring-me-primary-500"
              checked={options.replaceExisting}
              onChange={(event) =>
                setOptions((current) => ({ ...current, replaceExisting: event.currentTarget.checked }))
              }
            />
            <span className="text-sm font-medium text-zinc-700">Replace existing</span>
          </label>

          {hasMultiImage ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Multi-image canvases</span>
              <select
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-me-primary-500 focus:outline-none"
                value={options.multiImageMode}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, multiImageMode: event.target.value as MultiImageMode }))
                }
              >
                <option value="first">First image</option>
                <option value="composite">Full composite</option>
                <option value="layer">Specific layer</option>
              </select>
            </label>
          ) : null}

          {options.multiImageMode === "layer" && hasMultiImage ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Layer</span>
              <select
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-me-primary-500 focus:outline-none"
                value={options.selectedLayerIndex}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, selectedLayerIndex: Number(event.target.value) }))
                }
              >
                {Array.from({ length: Math.max(request.preview.maxLayerCount, 1) }, (_, index) => (
                  <option key={index} value={index}>
                    Layer {index + 1}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {/* Right: Thumbnail preview grid */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Canvas preview</span>
            <span className="text-xs text-zinc-400">
              {thumbnailCount > 0 ? (
                <span className="font-medium text-me-primary-500">{thumbnailCount} will be built</span>
              ) : (
                "All up to date"
              )}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {request.preview.canvases.map((canvas) => {
                const willBuild = options.replaceExisting || !canvas.hasThumbnail;
                return (
                  <ThumbnailPreviewCell
                    key={canvas.id}
                    canvasId={canvas.id}
                    label={canvas.label}
                    willBuild={willBuild}
                    hasExisting={canvas.hasThumbnail}
                    replacing={canvas.hasThumbnail && options.replaceExisting}
                    requestedWidth={options.requestedWidth}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ThumbnailPreviewCell({
  canvasId,
  label,
  willBuild,
  hasExisting,
  replacing,
  requestedWidth,
}: {
  canvasId: string;
  label: string;
  willBuild: boolean;
  hasExisting: boolean;
  replacing: boolean;
  requestedWidth: number;
}) {
  return (
    <CanvasContext canvas={canvasId}>
      <div className="flex flex-col gap-1">
        <div
          className={[
            "relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100",
            willBuild
              ? replacing
                ? "ring-2 ring-me-primary-300"
                : "ring-2 ring-me-primary-500"
              : "opacity-40",
          ].join(" ")}
        >
          <ConfiguredSizeThumbnail key={requestedWidth} width={requestedWidth} />
          {willBuild ? (
            <span
              className={[
                "absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide",
                replacing
                  ? "bg-me-primary-100 text-me-primary-600"
                  : "bg-me-primary-500 text-white",
              ].join(" ")}
            >
              {replacing ? "Replace" : "Add"}
            </span>
          ) : null}
        </div>
        <span className="truncate text-center text-[11px] leading-tight text-zinc-500">{label}</span>
      </div>
    </CanvasContext>
  );
}

function ConfiguredSizeThumbnail({ width }: { width: number }) {
  const thumbnail = useThumbnail({ width }, true);
  const [loaded, setLoaded] = useState(false);

  if (!thumbnail?.id) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
        <span className="text-[10px] text-zinc-300">No image</span>
      </div>
    );
  }

  return (
    <>
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-zinc-200" />
      ) : null}
      <img
        src={thumbnail.id}
        alt=""
        loading="lazy"
        className={["absolute inset-0 h-full w-full object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0"].join(" ")}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

function openBulkThumbnailBuilderResults(actionId: string, result: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<{ actionId: string; result?: ThumbnailBuildResult }>(resultsEventName, {
      detail: {
        actionId,
        result: result as ThumbnailBuildResult | undefined,
      },
    }),
  );
}

function renderBulkThumbnailBuilderResults(actionId: string) {
  return <BulkThumbnailBuilderResultsModal actionId={actionId} />;
}

function BulkThumbnailBuilderResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<ThumbnailBuildResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ actionId: string; result?: ThumbnailBuildResult }>).detail;
      if (detail?.actionId === actionId && detail.result) {
        setActiveResult(detail.result);
      }
    };

    window.addEventListener(resultsEventName, listener);
    return () => window.removeEventListener(resultsEventName, listener);
  }, [actionId]);

  if (!activeResult) {
    return null;
  }

  return (
    <Modal title="Thumbnail results" onClose={() => setActiveResult(null)} className="max-w-2xl">
      <div className="flex min-h-0 flex-col gap-0 text-sm text-zinc-700">
        {/* Summary bar */}
        <div className="flex items-center gap-6 border-b border-zinc-100 px-5 py-4">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-semibold leading-none text-zinc-900">{activeResult.added}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Added</span>
          </div>
          {activeResult.skipped > 0 ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-semibold leading-none text-zinc-500">{activeResult.skipped}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Skipped</span>
            </div>
          ) : null}
          {activeResult.failed > 0 ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-semibold leading-none text-red-500">{activeResult.failed}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Failed</span>
            </div>
          ) : null}
          <div className="ml-auto text-xs text-zinc-400">
            {activeResult.verified > 0 ? `${activeResult.verified} verified` : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto" style={{ maxHeight: "52vh" }}>
          {activeResult.changes.length ? (
            <div>
              <div className="sticky top-0 z-10 border-b border-zinc-100 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Added thumbnails
              </div>
              {activeResult.changes.map((item) => (
                <div
                  key={`${item.targetType}-${item.targetId}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-zinc-50 px-5 py-2.5 last:border-0 hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-zinc-700">{item.targetId}</div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-zinc-400">{item.thumbnailId}</div>
                  </div>
                  <div className="flex-none self-center rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {item.width ? `${item.width}${item.height ? `×${item.height}` : "px"}` : item.targetType}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeResult.skippedTargets.length ? (
            <div>
              <div className="sticky top-0 z-10 border-b border-zinc-100 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Skipped
              </div>
              {activeResult.skippedTargets.map((item) => (
                <div
                  key={`${item.targetType}-${item.targetId}-${item.reason}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-zinc-50 px-5 py-2.5 last:border-0 hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-zinc-700">{item.targetId}</div>
                  </div>
                  <div className="flex-none self-center text-xs text-zinc-400">{item.reason}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
