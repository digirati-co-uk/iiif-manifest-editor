import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { useLayoutEffect, useRef } from "react";
import { useSetCustomTitle } from "@/shell/Layout/components/ModularPanel";
import { Vault } from "@iiif/helpers/vault";
import { getValue } from "@iiif/helpers";

const exampleTutorial = {
  startingManifest: {
    id: "https://example.org/tutorial-1",
    "@context": "http://iiif.io/api/presentation/3/context.json",
    type: "Manifest",
    items: [],
  },
  steps: [
    {
      label: "Creating the canvas",
      startingState: (manifest: any, vault: Vault) => ({ canvases: vault.get(manifest).items.length }),
      items: [
        {
          text: `Click on <span data-prompt="edit-manifest">Edit manifest</span> to edit the manifest properties`,
          completion: { type: "editor", resource: "Manifest" },
        },
        {
          text: `Choose <span data-prompt="edit-manifest">Structural properties</span> from the tabs`,
          completion: { type: "editor", resource: "Manifest", editor: "@manifest-editor/manifest-structural" },
        },
        {
          text: `To get started hit <span data-prompt="add-canvas">Add canvas</span>`,
          completion: { type: "creator", resource: "Canvas" },
        },
        {
          text: `Create an <span data-prompt="empty-canvas">empty canvas</span> for us to add content to`,
          completion: { type: "creator", resource: "Canvas", creator: "@manifest-editor/empty-canvas" },
        },
        {
          text: `Hit <span data-prompt="create">create</span> to confirm your selection`,
          completion: {
            type: "state-change",
            confirmed: (startingState: any, newState: any) => newState.canvases > startingState.canvases,
          },
        },
      ],
    },
  ],
};

const exampleExhibition = {
  startingManifest: {
    id: "https://example.org/tutorial-1",
    "@context": "http://iiif.io/api/presentation/3/context.json",
    type: "Manifest",
    items: [],
  },
  steps: [
    {
      label: "Manifest information",
      items: [
        {
          text: `Give the manifest a label by first selecting <span data-prompt="edit-manifest">Edit manifest</span>`,
          completion: { type: "editor", resource: "Manifest" },
        },
        {
          text: `Choose <span data-prompt="edit-manifest">Descriptive properties</span> from the tabs`,
          completion: { type: "editor", resource: "Manifest", editor: "@manifest-editor/manifest-descriptive" },
        },
        {
          text: `Add your label to your Manifest`,
          completion: {
            type: "vault-state",
            confirmed: (manifest: any, vault: Vault) => !!getValue(vault.get(manifest).label),
          },
        },
      ],
      completion: {
        text: "Well done, now we can move on to adding a Canvas to our Manifest",
        action: "First canvas",
      },
    },
    {
      label: "Canvas 1: The only woman in the lecture hall",
      items: [
        {
          text: `Click on <span data-prompt="edit-manifest">Edit manifest</span> to edit the manifest properties`,
          completion: { type: "editor", resource: "Manifest" },
          optional: true,
        },
        {
          text: `Choose <span data-prompt="edit-manifest">Structural properties</span> from the tabs`,
          completion: { type: "editor", resource: "Manifest", editor: "@manifest-editor/manifest-structural" },
        },
        {
          text: `To get started hit <span data-prompt="add-canvas">Add canvas</span>`,
          completion: { type: "creator", resource: "Canvas" },
        },
      ],
    },
  ],
};

export function Tutorial() {
  const ref = useRef<HTMLDivElement>(null);
  const set = useSetCustomTitle();

  set("Tutorial list");

  useLayoutEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const prompt = target.getAttribute("data-prompt");
        console.log("prompt!", prompt);
      }
    };
    const $el = ref.current;

    $el!.addEventListener("click", handler, { capture: true });

    return () => {
      $el!.removeEventListener("click", handler);
    };
  });

  return (
    <PaddedSidebarContainer style={{ height: 300 }} ref={ref}>
      <h3>Tutorials</h3>
      <p>Get started with the Manifest Editor</p>

      <p>
        To get started hit <span data-prompt="add-canvas">Add canvas</span>
      </p>
    </PaddedSidebarContainer>
  );
}
