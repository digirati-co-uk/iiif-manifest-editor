"use client";

import { collectionPreset } from "@manifest-editor/collection-preset";
import { extendApp } from "@manifest-editor/shell";
import BrowserEditor from "./BrowserEditor";

const collectionWithPreviews = extendApp(collectionPreset, collectionPreset.metadata, {
  config: {
    previews: [
      {
        id: "theseus",
        type: "external-manifest-preview",
        label: "Theseus",
        config: {
          url: "https://theseusviewer.org/?iiif-content={manifestId}&ref=manifest-editor",
        },
      },
      {
        id: "mirador-3",
        type: "external-manifest-preview",
        label: "Mirador 3",
        config: {
          url: "https://projectmirador.org/embed/?iiif-content={manifestId}",
        },
      },
      {
        id: "iiif-preview",
        type: "iiif-preview-service",
        label: "IIIF Preview",
        config: {
          url: "/api/iiif/store",
        },
      },
      {
        id: "raw-manifest",
        type: "external-manifest-preview",
        label: "Collection JSON",
        config: {
          url: "{manifestId}",
        },
      },
    ],
  },
});

export default function BrowserCollectionEditor({ id }: { id: string }) {
  return <BrowserEditor id={id} preset={collectionWithPreviews} />;
}
