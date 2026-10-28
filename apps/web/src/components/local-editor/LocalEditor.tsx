"use client";
import { HeaderLanguageSwitcher } from "../site/HeaderLanguageSwitcher";

import { useTranslations, useEditorI18n } from "@manifest-editor/i18n";

import { Vault } from "@iiif/helpers";
import { upgrade } from "@iiif/parser/upgrader";
import { ManifestEditorLogo } from "@manifest-editor/components";
import { type FileWithHandle, fileOpen, fileSave, supported } from "browser-fs-access";
import { ManifestEditor } from "manifest-editor";
import { webUiResources } from "../../i18n/resources";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobalNav } from "../site/GlobalNav";

export default function LocalEditor() {
  const webT = useTranslations("web");

  const { locale } = useEditorI18n();
  const [file, setFile] = useState<FileWithHandle | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);
  const [vault] = useState(() => new Vault());
  const [lastModified, setLastModified] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!supported) {
    return (
      <div>
        <HeaderLanguageSwitcher />
        {webT("local.unsupported")}
      </div>
    );
  }

  if (!file || !manifest) {
    return (
      <div>
        <HeaderLanguageSwitcher />
        {error ? <p role="alert">{webT(error)}</p> : null}
        <button
          onClick={async () => {
            setError(null);
            try {
              const selectedFile = await fileOpen({ mimeTypes: ["json/*"] });
              const json = JSON.parse(await selectedFile.text());
              const upgraded = upgrade(json);
              if (!upgraded) {
                setError("local.upgradeFailed");
                return;
              }
              vault.loadManifestSync(upgraded.id, upgraded);
              setFile(selectedFile);
              setManifest(upgraded);
              setLastModified(selectedFile.lastModified);
            } catch (cause) {
              if (!(cause instanceof Error && cause.name === "AbortError")) setError("feedback.fileFailed");
            }
          }}
        >
          {webT("local.open")}
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="min-h-[64px] flex flex-wrap w-full gap-3 p-3 items-center border-b shadow">
        <Link
          href="/"
          className="min-w-0 flex justify-start"
          onClick={(event) => {
            if (!confirm(webT("local.leaveConfirm"))) event.preventDefault();
          }}
        >
          <ManifestEditor localisation={webUiResources} Logo />
        </Link>
        <div className="flex-1 flex gap-2"></div>
        <HeaderLanguageSwitcher />
        <div>
          <GlobalNav />
        </div>
      </header>
      {error ? <p role="alert">{webT(error)}</p> : null}
      <div className="bg-yellow-50 p-3 flex gap-2 items-center">
        {webT("local.editingFile", { name: file.name })}
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
            setError(null);
            try {
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
            } catch (cause) {
              if (!(cause instanceof Error && cause.name === "AbortError")) setError("feedback.saveFailed");
            }
          }}
        >
          {webT("actions.save")}
        </button>
        <div className="text-xs text-gray-500">
          {lastModified
            ? webT("local.lastModified", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(lastModified),
              })
            : null}
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="w-full flex flex-1 max-w-full min-w-0">
          <ManifestEditor
            localisation={webUiResources}
            vault={vault as any}
            resource={{ id: manifest.id, type: "Manifest" }}
            data={manifest as any}
          />
        </div>
      </div>
    </>
  );
}
