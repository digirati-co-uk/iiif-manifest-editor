import { getValue } from "@iiif/vault-helpers";
import * as IIIFVault from "@iiif/vault";

// This is from the ts version
// Create an image in the DOM to measure height and width
const getImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const $img = document.createElement("img");
    $img.onload = () => resolve($img);
    $img.onerror = () => reject();
    $img.src = src;
    if ($img.complete) {
      resolve($img); // cached.
    }
  });
};

const getAudioVideo = async (src: string) => {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    // Video tag accepts both.
    const $media = document.createElement("video");
    $media.onloadedmetadata = () => resolve($media);
    $media.onerror = () => reject();
    $media.preload = "metadata";
    $media.src = src;
  });
};

// use the hints from the user (if any), plus defaults, to get the order
// in which to try various analysis
function makeTryList(suppliedExpectedTypes: string[]) {
  const defaults = ["Image", "ImageService", "ManifestOrCollection", "ContentState"];
  let tryList: string[] = [];
  if (!suppliedExpectedTypes || suppliedExpectedTypes.length === 0) {
    tryList = defaults;
  }
  mergeList(suppliedExpectedTypes, tryList);
  mergeList(defaults, tryList);
  return tryList;
}

function mergeList(inputList: string[], outputList: string[]) {
  inputList.map((t: string) => {
    if (t === "Image" && !outputList.includes("Image")) {
      outputList.push("Image");
    }
    if (t === "ImageService" && !outputList.includes("ImageService")) {
      outputList.push("ImageService");
    }
    if (t === "Manifest" && !outputList.includes("ManifestOrCollection")) {
      outputList.push("ManifestOrCollection");
    }
    if (t === "Collection" && !outputList.includes("ManifestOrCollection")) {
      outputList.push("ManifestOrCollection");
    }
    if (t === "ManifestOrCollection" && !outputList.includes("ManifestOrCollection")) {
      outputList.push("ManifestOrCollection");
    }
    if (t === "ContentState" && !outputList.includes("ContentState")) {
      outputList.push("ContentState");
    }
  });
}

export async function detectMedia() {
  //
}

export async function analyse(url: string, ...expectedTypes: string[]) {
  // const tryList = makeTryList(expectedTypes);

  if (!url) {
    return;
  }

  // 2 new options:
  //  - Audio
  //  - Video
  // Only support them if they end in mp3 or mp4
  if (url.endsWith(".mp3") || url.endsWith(".mp4") || url.endsWith(".m4a") || url.endsWith(".m4v")) {
    try {
      const av = await getAudioVideo(url);
      if (av) {
        const isAudio = av.videoWidth === 0;
        return {
          id: url,
          type: av.videoWidth === 0 ? "Sound" : "Video",
          width: av.videoWidth || undefined, // naturalWidth
          height: av.videoHeight || undefined, // naturalHeight
          duration: av.duration,
          format: isAudio ? "audio/mp4" : "video/mp4",
        };
      }
    } catch (e) {
      // fall through..
    }
  }

  // This doesn't use the tryList order yet.
  // One advantage of doing a fetch first _even if we expect an image_ is that
  // we might capture the content type, if the image is CORS-enabled.
  let response = null;
  try {
    // Try head request, if that works...
    await fetch(url, { method: "HEAD" });

    // then fetch the full resource.
    response = await fetch(url);
  } catch {
    // can handle the error better, but maybe CORS error happened so:
    return handleNonFetchableUrl(url);
  }

  if (!response.ok) {
    response = await fetch(url + "/info.json");
    if (!response.ok) {
      return handleNonFetchableUrl(url);
    }
  }

  // but... it might have been a CORS-enabled image, or an image from an image service.
  // In this scenario we can capture the content type right here.
  const contentTypeHeader = response.headers.get("Content-Type");
  if (contentTypeHeader?.includes("image/")) {
    return handleNonFetchableUrl(url, contentTypeHeader);
  }

  // OK, it's probably NOT an image, and we have an OK response, so can we get JSON from it?
  let data = null;
  try {
    data = await response.json();
  } catch {
    return null;
  }

  return await analyseJson(data, url);
}

function asImageService(data: any) {
  if (data.protocol && data.protocol === "http://iiif.io/api/image") {
    if (!data.type) {
      data.type = "ImageService";
    }
    // NB this will be ImageService3 if it's a v3 img service
    return data;
  }
  return null;
}

export async function analyseJson(data: any, url: string) {
  // Is it an image service?
  const testImageService = asImageService(data);
  if (testImageService) {
    return testImageService;
  }

  // does it have an ID?
  const dataId = data.id || data["@id"];
  if (!dataId) {
    return null;
  }
  const vault = new IIIFVault.Vault();
  const vaultData = await vault.load(url, data); // we could use dataId here, but just in case it's wrong...
  if (!vaultData) {
    return;
  }
  // @ts-ignore
  if ((vaultData && vaultData?.type === "Manifest") || vaultData?.type === "Collection") {
    return {
      id: url,
      // @ts-ignore
      type: vaultData.type,
      // @ts-ignore
      label: getValue(vaultData.label),
    };
  }
}

async function handleNonFetchableUrl(url: string, capturedContentType?: string) {
  // it *is* an image... but is it an image from an image service?
  // In its current form this should be tried before any fetch happens
  // that is, does it match:
  // http<s>://<any.org>/<any-prefix>/region/size/rotation/format.quality ?
  // This should really call Stephen's IIIF Image API parser, and if it's a success, we know it's
  // probably an image service
  // https://github.com/atlas-viewer/iiif-image-api
  // https://github.com/atlas-viewer/iiif-image-api/blob/main/src/utility/parse-image-service-request.ts
  const parts = url.split("/");
  if (parts.length >= 8) {
    // might be an image service
    const iiifParts = parts.slice(-4);
    // need to do more than this but the parser can do the hard work
    if (iiifParts[3].split(".").length === 2) {
      // This is not reliable! parse it properly!
      if (iiifParts[2][0] === "!" || iiifParts[2] === iiifParts[2]) {
        // rotation param is numeric
        // this is worth trying as an image service
        const serviceUrl = parts.slice(0, parts.length - 4).join("/") + "/info.json";
        // assume this is a low cost thing to try
        const imgService = await getImageService(serviceUrl);
        if (imgService && imgService?.type && imgService?.type?.startsWith("ImageService")) {
          return imgService;
        }
      }
    }
  }

  // OK we didn't find an image service behind that image URL. So now it's time to use the DOM.

  try {
    const image = (await getImage(url)) as any;
    const data = {
      id: url,
      type: "Image",
      width: image.width, // naturalWidth
      height: image.height, // naturalHeight
      format: await getFormat(url, capturedContentType),
    };
    return data;
  } catch {}

  return null;
}

async function getImageService(url: string) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return await analyseJson(data, url);
    }
    return null;
  } catch (e: any) {
    console.log(e);
    return null;
  }
}

export async function getFormat(url: string, capturedContentType?: string) {
  if (capturedContentType) {
    // we managed to learn this earlier, the image had CORS
    return capturedContentType;
  }
  try {
    // a HEAD request doesn't have CORS issues... well it didn't used to...
    const response = await fetch(url, { method: "HEAD", mode: "no-cors" });
    const ct = response.headers.get("Content-type");
    if (ct) {
      return ct;
    }
  } catch (e) {
    // ignore.
  }

  // if the above still fails, we could fall back to guessing
  // content-type from the URL  (.jpg etc).
  const test = url.toLowerCase();
  if (test.endsWith("jpg") || test.endsWith("jpeg")) {
    return "image/jpeg";
  }
  if (test.endsWith("png")) {
    return "image/png";
  }
  // Just a default.
  return "image/jpeg";
}

export async function getImageDimensions(url: string) {
  try {
    const image = await getImage(url);
    if (image) {
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}
