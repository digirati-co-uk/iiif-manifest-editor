import { LanguageProperty } from "@iiif/presentation-2";

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

interface State<T> {
  data?: T;
  error?: Error;
}
export const analyse = async (url: string, expectedTypes?: Array<"Image" | "ImageService" | "Manifest" | "Collection">) => {
  let data: any = {};
  if (!url) return;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    data = (await response.json()) as T;
    console.log(data);

  } catch (error) {
    console.log(error);
  }


  return {
    id: url,
    type: "Image",
    // format: string,
    // width: number,
    // height: number
  }
};
