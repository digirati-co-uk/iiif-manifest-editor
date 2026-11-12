import { Vault } from "@iiif/helpers/vault";
import { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CanvasContext, CanvasStrategyProvider, useCanvas, useStrategy, VaultProvider } from "react-iiif-vault";
import { describe, expect, test, vi } from "vitest";

// Keep the test about the real vault resource + rendering strategy contexts, without mounting the editor shell.
vi.mock("@manifest-editor/shell", async () => {
  const { createContext } = await import("react");
  return {
    EditingStackContext: createContext(null),
    LayoutActionsReactContext: createContext(null),
    ResourceEditingProvider: ({ children }: { children: ReactNode }) => children,
    useLayoutActions: () => ({ edit() {} }),
  };
});
vi.mock("@manifest-editor/components", () => ({ Sidebar: () => null, SidebarContent: () => null }));
vi.mock("./ExhibitionImagesEditor", () => ({ ExhibitionImagesContent: () => null }));
import { AudioArtworkCanvasScope } from "./AudioArtworkPanel";

function Capture({ name }: { name: string }) {
  const canvas = useCanvas();
  const { strategy } = useStrategy();
  return <div data-name={name} data-canvas={canvas?.id} data-strategy={strategy.type} />;
}

describe("audio artwork rendering scope", () => {
  test.each([true, false])("recalculates the artwork strategy instead of inheriting Sound (image=%s)", (hasImage) => {
    const vault = new Vault();
    const artwork = {
      id: "https://example.org/artwork", type: "Canvas", width: 600, height: 400,
      items: hasImage ? [{ id: "https://example.org/artwork/page", type: "AnnotationPage", items: [{
        id: "https://example.org/artwork/annotation", type: "Annotation", motivation: "painting",
        target: "https://example.org/artwork", body: { id: "https://example.org/artwork.jpg", type: "Image", width: 600, height: 400 },
      }] }] : [],
    };
    const sound = {
      id: "https://example.org/audio", type: "Canvas", duration: 30, accompanyingCanvas: artwork,
      items: [{ id: "https://example.org/audio/page", type: "AnnotationPage", items: [{
        id: "https://example.org/audio/annotation", type: "Annotation", motivation: "painting",
        target: "https://example.org/audio", body: { id: "https://example.org/audio.mp3", type: "Sound", duration: 30 },
      }] }],
    };
    vault.loadSync(sound.id, sound as any);
    const html = renderToStaticMarkup(
      <VaultProvider vault={vault}>
        <CanvasContext canvas={sound.id}>
          <CanvasStrategyProvider strategies={["media", "images"]}>
            <Capture name="audio" />
            <AudioArtworkCanvasScope canvasId={artwork.id}><Capture name="artwork" /></AudioArtworkCanvasScope>
          </CanvasStrategyProvider>
        </CanvasContext>
      </VaultProvider>,
    );
    expect(html).toContain('data-name="audio" data-canvas="https://example.org/audio" data-strategy="media"');
    expect(html).toContain(`data-name="artwork" data-canvas="https://example.org/artwork" data-strategy="${hasImage ? "images" : "empty"}"`);
  });
});
