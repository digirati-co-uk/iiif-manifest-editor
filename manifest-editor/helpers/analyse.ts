import { LanguageProperty } from "@iiif/presentation-2";
import * as IIIFVault from "@iiif/vault";
import { getValue } from "@iiif/vault-helpers";

export type Image = {
  id: string,
  type: "Image",
  format: string,
  width: number,
  height: number
}

export type Manifest = {
  id: string,
  type: "Manifest",
  label: LanguageProperty
}

export type Collection = {
  id: string,
  type: "Collection",
  label: LanguageProperty
}


const handleImageService = async (imageUrl: string) => {
  let data: any = {};
  if (!imageUrl) return;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(response.statusText);
    };
    data = (await response.json()) as any;
  } catch { };
  return data;
};

const handleImages = async (url: string) => {
  let data: any = {};

  try {
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    if (response.headers.get("Content-Type")?.includes("ld+json")) {
      data = await handleImageService(url) as any;
    } else if (response.headers.get("Content-Type")?.includes("image")) {
      data = {
        id: url,
        type: "Image",
        format: response.headers.get("Content-Type"),
      }
    }
  } catch {
    // error
  }
  return data;
}

export const analyse = async (url: string, expectedTypes?: Array<"Image" | "ImageService" | "Manifest" | "Collection">) => {
  if (!url) return;
  let data: any = {}

  // Static images
  if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png") || url.includes(".JP2")) {
    data = await handleImages(url)
    return data;
  };

  // info.json image service
  if (url.includes("/info.json")) {
    data = await handleImageService(url);
    return data;
  };

  // Else we want to handle manifest and collections using vault
  const vault = new IIIFVault.Vault();
  data = await vault.load(url);
  if (!data) return;
  if (data.type === "Manifest" || data.type === "Collection") {
    return {
      id: url,
      type: data.type,
      label: getValue(data.label)
    };
  };
};
