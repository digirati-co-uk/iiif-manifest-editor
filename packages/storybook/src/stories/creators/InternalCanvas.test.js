import { Vault } from "@iiif/helpers";
import { expect, test } from "vitest";
import { Creator } from "../../../../creator-api/src/Creator";
import { internalCanvas } from "../../../../creators/src/Canvas/InternalCanvas";

test("linking the start Canvas preserves its dimensions and painting resources", async () => {
  const vault = new Vault();
  const id = "https://example.org/manifest";
  const selected = { id: `${id}/canvas`, type: "Canvas" };
  vault.loadManifestSync(id, {
    id,
    type: "Manifest",
    label: { en: ["Start canvas"] },
    items: [
      {
        ...selected,
        label: { en: ["Original canvas"] },
        width: 640,
        height: 480,
        items: [
          {
            id: `${id}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${id}/annotation`,
                type: "Annotation",
                motivation: "painting",
                target: selected.id,
                body: {
                  id: "https://example.org/image.jpg",
                  type: "Image",
                  width: 640,
                  height: 480,
                  format: "image/jpeg",
                },
              },
            ],
          },
        ],
      },
    ],
  });
  const original = vault.toPresentation3(selected);
  await new Creator(vault, [internalCanvas]).create(
    internalCanvas.id,
    { id: selected.id },
    {
      parent: { resource: { id, type: "Manifest" }, property: "start" },
    }
  );
  expect(vault.toPresentation3(selected)).toEqual(original);
  expect(vault.get({ id, type: "Manifest" }).start).toMatchObject(selected);
});
