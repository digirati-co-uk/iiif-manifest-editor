import { ManifestNormalized } from "@iiif/parser/presentation-4-normalized/types";

export async function getManifestNomalized(id: string): Promise<ManifestNormalized | undefined> {
  let responseData: ManifestNormalized | undefined = undefined;
  try {
    await fetch(id)
      .then((response) => {
        return response.json().catch((err) => {
          console.error(`'${err}' happened!`);
        });
      })
      .then((data) => {
        responseData = { ...data };
      });
  } catch (error) {
    console.log(error);
  }
  return responseData;
}
