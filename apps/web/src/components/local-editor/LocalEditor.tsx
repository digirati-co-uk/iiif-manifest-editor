"use client";

import { FileWithHandle, fileOpen, fileSave, supported } from "browser-fs-access";
import { ManifestEditor } from "manifest-editor";
import { useEffect, useMemo, useState } from "react";
import "manifest-editor/dist/index.css";
import Link from "next/link";
import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
import { GlobalNav } from "../site/GlobalNav";
import { Vault } from "@iiif/helpers";

export default function LocalEditor() {
  const [file, setFile] = useState<FileWithHandle | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);
  const vault = useMemo(() => new Vault(), []);
  const [lastModified, setLastModified] = useState<number | null>(null);

  if (!supported) {
    return <div>Browser FS Access not supported</div>;
  }

  if (!file || !manifest) {
    return (
      <div>
        <button
          onClick={async () => {
            const file = await fileOpen({ mimeTypes: ["json/*"] });
            if (file) {
              setFile(file);
              const text = await file.text();
              const manifest = JSON.parse(text);
              setManifest(JSON.parse(text));
              vault.loadManifestSync(manifest.id, manifest);
              setLastModified(file.lastModified);
            }
          }}
        >
          Open file
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="h-[64px] flex w-full gap-12 px-4 items-center border-b">
        <Link href="/" className="w-96 flex justify-start" onClick={() => confirm("Are you sure?")}>
          <ManifestEditorLogo className="me-logo h-[27px] w-[206px]" />
        </Link>
        <div className="flex-1 flex gap-2"></div>
        <div>
          <GlobalNav />
        </div>
      </header>
      <div className="bg-yellow-50 p-3 flex gap-2 items-center">
        Editing local file <strong>{file.name}</strong>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
          onClick={async () => {
            if (!file || !manifest || !vault) {
              return;
            }
            const manifestJson = vault.toPresentation3({ id: manifest.id, type: "Manifest" });
            if (!manifestJson) {
              return;
            }
            const blob = new Blob([JSON.stringify(manifestJson, null, 2)], { type: "application/json" });
            const handle = await fileSave(
              blob,
              {
                fileName: file.name,
                extensions: [".json"],
              },
              file.handle
            );
            if (handle) {
              const file = await handle.getFile();
              if (file) {
                setLastModified(file.lastModified);
              }
            }
          }}
        >
          Save changes
        </button>
        <div className="text-xs text-gray-500">
          Last modified:
          {lastModified ? new Date(lastModified).toLocaleString() : null}
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="w-full flex flex-1 max-w-full min-w-0">
          <ManifestEditor vault={vault} resource={{ id: manifest.id, type: "Manifest" }} data={manifest as any} />
        </div>
      </div>
    </>
  );
}
