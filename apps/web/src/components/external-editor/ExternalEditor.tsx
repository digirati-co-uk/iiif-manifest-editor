"use client";

import { Vault } from "@iiif/helpers";
import { ActionButton, ManifestEditorLogo } from "@manifest-editor/components";
import { exhibitionEditorPreset } from "@manifest-editor/exhibition-preset";
import * as manifestPreset from "@manifest-editor/manifest-preset";
import {
  AppProvider,
  Layout,
  type MappedApp,
  ShellProvider,
  mapApp,
  useDecayState,
  useSaveVault,
} from "@manifest-editor/shell";
import { useMutation, useQuery } from "@tanstack/react-query";
import "@manifest-editor/exhibition-preset/dist/index.css";
import { type SVGProps, useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-aria-components";
import { VaultProvider, useExistingVault } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";

const presets: Record<string, MappedApp> = {
  manifest: mapApp(manifestPreset),
  exhibition: exhibitionEditorPreset,
};

export default function ExternalEditor({
  manifest,
  preset,
}: { manifest: string; preset?: string }) {
  const vault = useMemo(() => {
    return new Vault();
  }, [manifest, preset]);

  const mergedConfig = useMemo(() => {
    // @todo .
    return {};
  }, [preset]);

  const resolvedPreset = (
    preset ? presets[preset] || presets.manifest : presets.manifest
  ) as MappedApp;

  const [saved, setSaved] = useDecayState(5000);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const lastSavedJson = useRef("");

  const { data: manifestData, isLoading } = useQuery({
    queryKey: ["manifest-extenrnal", { manifest }],
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const resp = await fetch(manifest, { mode: "cors" });
      if (!resp.ok) {
        return null;
      }

      const postUrl = resp.headers.get("X-Iiif-Post-Url");
      if (!postUrl) {
        return null;
      }

      const manifestJson = await resp.json();

      const loaded = vault.loadManifestSync(
        manifestJson.id || manifestJson["@id"],
        manifestJson,
      );

      if (!loaded) {
        return null;
      }

      lastSavedJson.current = JSON.stringify(
        vault.toPresentation3({
          id: loaded.id,
          type: "Manifest",
        }),
      );

      return {
        postUrl,
        ref: {
          id: loaded.id,
          type: "Manifest",
        },
        json: manifestJson,
      };
    },
  });

  const onVaultSave = useCallback(() => {
    if (manifestData?.ref) {
      console.log("save");
      const manifest = JSON.stringify(
        vault.toPresentation3(manifestData.ref as any),
      );
      if (lastSavedJson.current !== manifest) {
        setUnsavedChanges(true);
        setSaved.clear();
        console.log("saved!");
      }
    }
  }, [vault, manifestData]);

  useSaveVault(vault, onVaultSave, 1000, !!manifestData);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: any) => {
      const postUrl = manifestData?.postUrl;
      if (!postUrl) {
        return;
      }

      const toSave = vault.toPresentation3(manifestData.ref as any);
      if (!toSave || !(toSave as any).id) return;
      const json = JSON.stringify(toSave);

      const resp = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: json,
      });

      if (!resp.ok) {
        throw new Error("Failed to save");
      }

      lastSavedJson.current = json;
      setUnsavedChanges(false);
      setSaved.set();
    },
  });

  // 4. Load the editor
  if (isLoading || !manifestData) {
    return <div>Loading...</div>;
  }

  const header = (
    <header className="h-[64px] flex w-full gap-12 px-4 items-center shadow">
      <Link href="/" target="_blank" className="w-96 flex justify-start">
        <ManifestEditorLogo />
      </Link>
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-gray-100 py-2 px-4 rounded flex gap-2">
          <span className="text-black/50">Remote resource:</span>
          <a
            className="text-me-primary-500 font-semibold underline"
            href={manifest}
          >
            {manifest}
          </a>
        </div>
      </div>
      <div className="flex items-center justify-center gap-5">
        <div className="flex items-center gap-2">
          <a
            target="_blank"
            href={`https://theseusviewer.org?iiif-content=${manifest}`}
            className="px-3 py-2 gap-3 disabled:text-white/50 text-sm underline"
            rel="noreferrer"
          >
            Open in Theseus
          </a>

          <ActionButton
            className="px-3 py-2 gap-3 disabled:text-white/50"
            primary
            isDisabled={isPending || !unsavedChanges}
            onPress={() => mutate({})}
          >
            <CloudIcon
              className="text-xl translate-y-0 transition-transform"
              saved={saved}
              saving={isPending}
            />{" "}
            {isPending
              ? "Saving..."
              : unsavedChanges
                ? "Save changes"
                : saved
                  ? "Saved"
                  : "No changes"}
          </ActionButton>
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex flex-1 h-[100vh] w-full">
      <VaultProvider vault={vault}>
        <AppProvider
          appId="manifest-editor"
          definition={resolvedPreset}
          instanceId={manifest}
        >
          <VaultProvider vault={vault}>
            <ShellProvider resource={manifestData.ref} config={mergedConfig}>
              <Layout header={header} />
            </ShellProvider>
          </VaultProvider>
        </AppProvider>
      </VaultProvider>
    </div>
  );
}

function CloudIcon({
  saving,
  saved,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { saved: boolean; saving: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      className={twMerge(className, saving ? "animate-pulse" : "")}
      {...props}
    >
      {saving ? (
        <>
          <path
            fill="currentColor"
            d="m19.21 12.04l-1.53-.11l-.3-1.5A5.484 5.484 0 0 0 12 6C9.94 6 8.08 7.14 7.12 8.96l-.5.95l-1.07.11A3.99 3.99 0 0 0 2 14c0 2.21 1.79 4 4 4h13c1.65 0 3-1.35 3-3c0-1.55-1.22-2.86-2.79-2.96"
            opacity=".3"
          />
          <path
            fill="currentColor"
            d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.47 5.47 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3"
          />
        </>
      ) : saved ? (
        <>
          <path
            fill="currentColor"
            d="m19.21 12.04l-1.53-.11l-.3-1.5A5.484 5.484 0 0 0 12 6C9.94 6 8.08 7.14 7.12 8.96l-.5.95l-1.07.11A3.99 3.99 0 0 0 2 14c0 2.21 1.79 4 4 4h13c1.65 0 3-1.35 3-3c0-1.55-1.22-2.86-2.79-2.96M10 17l-3.5-3.5l1.41-1.41L10 14.18l4.6-4.6l1.41 1.41z"
            opacity=".3"
          />
          <path
            fill="currentColor"
            d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.47 5.47 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3m-9-3.82l-2.09-2.09L6.5 13.5L10 17l6.01-6.01l-1.41-1.41z"
          />
        </>
      ) : (
        <>
          <path
            fill="currentColor"
            d="m19.21 12.04l-1.53-.11l-.3-1.5A5.484 5.484 0 0 0 12 6C9.94 6 8.08 7.14 7.12 8.96l-.5.95l-1.07.11A3.99 3.99 0 0 0 2 14c0 2.21 1.79 4 4 4h13c1.65 0 3-1.35 3-3c0-1.55-1.22-2.86-2.79-2.96m-5.76.96v3h-2.91v-3H8l4-4l4 4z"
            opacity=".3"
          />
          <path
            fill="currentColor"
            d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.47 5.47 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3M8 13h2.55v3h2.9v-3H16l-4-4z"
          />
        </>
      )}
    </svg>
  );
}
