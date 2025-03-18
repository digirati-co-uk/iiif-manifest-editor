import { ImageService } from "@iiif/presentation-3";
import type {
  CreatorDefinition,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";
import {
  createImageServiceRequest,
  imageServiceRequestToString,
  RegionParameter,
  SizeParameter,
} from "@iiif/parser/image-3";
import {
  CreateImageServicePayload
} from "@manifest-editor/creators/src/ContentResource/ImageServiceCreator/create-image-service";
import { imageServiceCreator } from '@manifest-editor/creators'

export const imageServiceSlideCreator: CreatorDefinition = {
  ...imageServiceCreator,
  id: "@exhibitions/image-service-creator",
  create: createImageService,
  tags: ["image", "exhibition-slide"],
  label: "IIIF Image",
  summary: "IIIF Image service",
}

interface CreateImageServicePayload {
  url: string;
  height?: number;
  width?: number;
  format?: string;
  service: ImageService;
  size?: SizeParameter;
  embedService?: boolean;
  selector?: RegionParameter;
}

async function createImageService(
  data: CreateImageServicePayload,
  ctx: CreatorFunctionContext,
) {
  const request = createImageServiceRequest(data.service);
  const imageId = imageServiceRequestToString({
    identifier: request.identifier,
    server: request.server,
    scheme: request.scheme,
    type: "image",
    size: {
      max: !data.size?.width && !data.size?.height,
      confined: false,
      upscaled: false,
      ...(data.size || {}),
    },
    format: "jpg",
    // This isn't how it should be modelled, always full,
    // region: data.selector ? data.selector : { full: true },
    region: { full: true },
    rotation: { angle: 0 },
    quality: "default",
    prefix: request.prefix,
    originalPath: (request as any).originalPath,
  });

  return ctx.embed({
    id: imageId,
    type: "Image",
    format: data.format || "image/jpeg",
    height: data.height || data.service.height,
    width: data.width || data.service.width,
    service: data.embedService === false ? undefined : [data.service],
  });
}
