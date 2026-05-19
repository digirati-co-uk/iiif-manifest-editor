"use client";

import { MessagePortClientVault } from "@manifest-editor/shell";
import {
  IFRAME_PREVIEW_CONNECT,
  IFRAME_PREVIEW_READY,
  IFRAME_PREVIEW_SELECTION,
} from "../iframe-preview-plugin/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AuthProvider,
  CanvasContext,
  CanvasPanel,
  ManifestContext,
  VaultProvider,
  useManifest,
} from "react-iiif-vault";

type PreviewConnection = {
  vault: MessagePortClientVault;
  resource: { id: string; type: string };
  canvasId: string | null;
};

export default function IframePreviewRoute() {
  const [connection, setConnection] = useState<PreviewConnection | null>(null);
  const vaultRef = useRef<MessagePortClientVault | null>(null);

  useEffect(() => {
    function handleWindowMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data._type === IFRAME_PREVIEW_CONNECT) {
        const port = event.ports[0];
        if (!port) return;
        const vault = new MessagePortClientVault(port);
        vaultRef.current?.destroy();
        vaultRef.current = vault;
        setConnection((current) => {
          return {
            vault,
            resource: data.resource,
            canvasId: data.canvasId || null,
          };
        });
      }

      if (data._type === IFRAME_PREVIEW_SELECTION) {
        setConnection((current) =>
          current
            ? {
                ...current,
                resource: data.resource || current.resource,
                canvasId: data.canvasId || null,
              }
            : current,
        );
      }
    }

    window.addEventListener("message", handleWindowMessage);
    const target =
      window.opener && !window.opener.closed
        ? window.opener
        : window.parent !== window
          ? window.parent
          : null;
    target?.postMessage(
      { _type: IFRAME_PREVIEW_READY },
      window.location.origin,
    );

    return () => {
      window.removeEventListener("message", handleWindowMessage);
      vaultRef.current?.destroy();
      vaultRef.current = null;
    };
  }, []);

  if (!connection) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        Waiting for preview connection...
      </main>
    );
  }

  if (connection.resource.type !== "Manifest") {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        Iframe preview supports manifests.
      </main>
    );
  }

  return (
    <VaultProvider vault={connection.vault}>
      <ManifestContext manifest={connection.resource.id}>
        <IframePreviewCanvas canvasId={connection.canvasId} />
      </ManifestContext>
    </VaultProvider>
  );
}

function IframePreviewCanvas({ canvasId }: { canvasId: string | null }) {
  const manifest = useManifest();
  const selectedCanvasId = useMemo(
    () =>
      canvasId && manifest?.items.some((item) => item.id === canvasId)
        ? canvasId
        : manifest?.items[0]?.id || null,
    [canvasId, manifest?.items],
  );

  if (!manifest) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        Loading manifest...
      </main>
    );
  }

  if (!selectedCanvasId) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        No canvas available.
      </main>
    );
  }

  return (
    <main className="h-screen min-h-0 bg-zinc-100">
      <CanvasContext canvas={selectedCanvasId}>
        <AuthProvider>
          <CanvasPanel.Viewer className="h-screen">
            <CanvasPanel.RenderCanvas />
          </CanvasPanel.Viewer>
        </AuthProvider>
      </CanvasContext>
    </main>
  );
}
