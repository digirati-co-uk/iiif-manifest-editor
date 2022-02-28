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


const handleImages = (imgUrl: string) => {
  const sizeOf = require('image-size')
  sizeOf.disableFS(true);

  const URL = require('url');
  const http = require('http');
  const options = URL.parse(imgUrl);
  let data = {};

  return new Promise((resolve) => {
    let req = http.get(options, function (response: any) {
      const chunks: any = [];
      response.on('data', function (chunk: any) {
        chunks.push(chunk);
      }).on('end', function () {
        const buffer = Buffer.concat(chunks);
        const properties = sizeOf(buffer);
        data = {
          id: imgUrl,
          type: "Image",
          format: properties.type,
          width: properties.width,
          height: properties.height
        };
        resolve(data);
      })
      req.end();
    })
    return data;
  })
};

const handleJSON = async (imageUrl: string) => {
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

export const analyse = async (url: string, expectedTypes?: Array<"Image" | "ImageService" | "Manifest" | "Collection">) => {
  if (!url) return;
  let data: any = {}

  // Static images
  if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png")) {
    data = await handleImages(url);
    return data;
  };

  // info.json image service
  if (url.includes("/info.json")) {
    data = await handleJSON(url);
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
