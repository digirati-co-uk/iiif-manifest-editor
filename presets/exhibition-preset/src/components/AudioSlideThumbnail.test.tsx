import { Vault } from "@iiif/helpers/vault";
import { renderToStaticMarkup } from "react-dom/server";
import { CanvasContext, VaultProvider } from "react-iiif-vault";
import { expect, test, vi } from "vitest";

// Thumbnail loading is effect-driven; resolve the actual current canvas body synchronously for SSR.
vi.mock("react-iiif-vault", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-iiif-vault")>();
  return {
    ...actual,
    useThumbnail: () => {
      const canvas = actual.useCanvas();
      const vault = actual.useVault();
      const page = canvas?.items[0] && vault.get(canvas.items[0]);
      const annotation = page?.items[0] && vault.get(page.items[0]);
      return annotation?.body[0] && vault.get(annotation.body[0]);
    },
  };
});
import { accompanyingImageCanvas } from "../audio-slide";
import { AudioSlideThumbnail } from "./AudioSlideThumbnail";

function render(withArtwork: boolean, behavior: string[] = []) {
  const vault = new Vault();
  const id = "https://example.org/audio";
  vault.loadSync(id, {
    id,
    type: "Canvas",
    behavior,
    label: { en: ["Interview"] },
    duration: 30,
    ...(withArtwork ? { accompanyingCanvas: accompanyingImageCanvas(id, "https://example.org/art.jpg") } : {}),
    items: [
      {
        id: `${id}/page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${id}/annotation`,
            type: "Annotation",
            motivation: "painting",
            target: id,
            body: { id: "https://example.org/audio.mp3", type: "Sound", duration: 30 },
          },
        ],
      },
    ],
  } as any);
  return renderToStaticMarkup(
    <VaultProvider vault={vault}>
      <CanvasContext canvas={id}>
        <AudioSlideThumbnail />
      </CanvasContext>
    </VaultProvider>
  );
}

test("audio thumbnail shows accompanying artwork and a sound marker without loading a player", () => {
  const html = render(true);
  expect(html).toContain('src="https://example.org/art.jpg"');
  expect(html).toContain('aria-label="Audio slide"');
  expect(html).toContain("object-contain");
  expect(html).not.toContain("<audio");
  expect(html).not.toContain('src="https://example.org/audio.mp3"');
  expect(render(true, ["image-cover"])).toContain("object-cover");
});

test("audio-only slides still show the Audio marker without broken or empty image elements", () => {
  const html = render(false);
  expect(html).toContain('aria-label="Audio slide"');
  expect(html).toContain("Audio</span>");
  expect(html).not.toContain("<img");
});
