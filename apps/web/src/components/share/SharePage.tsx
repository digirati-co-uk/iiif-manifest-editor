"use client";
import { HeaderLanguageSwitcher } from "../site/HeaderLanguageSwitcher";
export default function SharePage() {
  return (
    <>
      <header className="flex justify-end p-3">
        <HeaderLanguageSwitcher />
      </header>
      <SharePageBody />
    </>
  );
}

import { useTranslations } from "@manifest-editor/i18n";

import { Vault, createThumbnailHelper } from "@iiif/helpers";
import type { CanvasNormalized, CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { ActionButton } from "@manifest-editor/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type LocalBrowserProject,
  createCollectionFromId,
  createManifestFromId,
  getLatestEtag,
  internal_getBrowserProjectById,
  saveBrowserProjectVaultData,
} from "../browser-editor/browser-state";
import { SharePreviewEditor } from "./SharePreviewEditor";

function SharePageBody() {
  const webT = useTranslations("web");

  const router = useRouter();
  const [shouldPreview, setShouldPreview] = useState(false);

  // Forking the project
  const importProject = useMutation({
    mutationFn: async ({ existing, copy }: { existing?: LocalBrowserProject | null; copy?: boolean }) => {
      if (!queryString.resource) return;
      if (queryString.projectId && !copy) {
        if (existing) {
          const id = existing.id;
          const vault = new Vault();
          const thumbnailHelper = createThumbnailHelper(vault);
          const newResource = await vault.load<CollectionNormalized | ManifestNormalized>(queryString.resource);
          if (!newResource) throw new Error("Invalid resource");
          const data = vault.getState().iiif;
          const manifests = Object.keys(data.entities.Manifest || {});
          const collections = Object.keys(data.entities.Collection || {});

          if (manifests.length === 0 && collections.length === 0) {
            // Ignore empty vaults.
            return;
          }

          const etag = existing.etag || (await getLatestEtag(existing.id));
          if (!etag) throw new Error("Invalid etag");

          const thumbnail = await thumbnailHelper.getBestThumbnailAtSize(
            newResource,
            { width: 256, height: 256 },
            false
          );
          const resource = {
            id: newResource.id,
            type: newResource.type,
            label: newResource.label || { none: ["Untitled project"] },
            thumbnail: thumbnail?.best?.id || "",
          };

          await saveBrowserProjectVaultData(id, data, etag, resource);

          return { id };
        }

        if (queryString.resourceType === "Collection") {
          return await createCollectionFromId(queryString.resource, {
            imported: true,
            originalProjectId: queryString.projectId,
            projectId: copy ? undefined : queryString.projectId,
          });
        }

        return await createManifestFromId(queryString.resource, {
          imported: true,
          originalProjectId: queryString.projectId,
          projectId: copy ? undefined : queryString.projectId,
        });
      }

      if (queryString.resourceType === "Collection") {
        return await createCollectionFromId(queryString.resource, {
          imported: true,
        });
      }
      return await createManifestFromId(queryString.resource, {
        imported: true,
      });
    },
    onSuccess: (data) => {
      if (data) {
        const search = new URLSearchParams();
        if (queryString.state) {
          if (queryString.state.selected) {
            search.set("selected-id", queryString.state.selected.id);
            search.set("selected-type", queryString.state.selected.type!);
          }
          if (queryString.state.tab) {
            search.set("selected-tab", queryString.state.tab);
          }
          if (queryString.state.canvasId) {
            search.set("selected-canvas-id", queryString.state.canvasId);
          }
        }
        router.push(`/editor/${data.id}${queryString.preset ? `/${queryString.preset}` : ""}?${search.toString()}`);
      }
    },
  });

  const queryString = useMemo(() => {
    if (typeof window === "undefined") return {};

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const contentState = params.get("iiif-content");
    const resource = contentState;

    // Other options
    const projectId = params.get("projectId");
    const selected = params.get("selected-id");
    const selectedType = params.get("selected-type");
    const resourceType = params.get("resource-type");
    const canvasId = params.get("selected-canvas-id");
    const action = params.get("action") as null | "import" | "preview";
    const tab = params.get("selected-tab") as null;
    const preset = params.get("preset");

    return {
      resource,
      resourceType,
      projectId,
      action: action,
      preset,
      state: {
        canvasId,
        selected: selected
          ? {
              id: selected,
              type: selectedType,
            }
          : null,
        tab,
      },
    };
  }, []);

  const existingImportedProject = useQuery({
    queryKey: ["existing-imported-project", { projectId: queryString.projectId }],
    queryFn: async () => {
      if (queryString.action === "preview") return null;
      if (!queryString.projectId) return null;
      // @todo.
      return internal_getBrowserProjectById(queryString.projectId);
    },
  });

  useEffect(() => {
    if (existingImportedProject.isPending) return;
    if (queryString.action !== "import") return;
    if (!queryString.resource) return;
    if (!existingImportedProject.data) {
      importProject.mutate({});
    }
  }, [queryString, existingImportedProject.data, existingImportedProject.isPending]);

  if (importProject.isError || existingImportedProject.isError)
    return <p role="alert">{webT("feedback.importFailed")}</p>;
  if (importProject.isPending) return <output>{webT("feedback.loading")}</output>;

  if ((shouldPreview || queryString.action === "preview") && queryString.resource) {
    return (
      <div className="flex flex-col flex-1">
        {queryString.action === "preview" ? (
          <div className="bg-me-primary-100 p-4 text-center flex gap-4 items-center">
            <div>{webT("share.previewing")}</div>
            <ActionButton onPress={() => importProject.mutate({ copy: true })}>
              {webT("share.copyProject")}
            </ActionButton>
          </div>
        ) : (
          <div className="bg-me-primary-100 p-4 text-center flex gap-4 items-center">
            <ActionButton onPress={() => setShouldPreview(false)}>{webT("actions.back")}</ActionButton>
            <h3 className="text-lg font-semibold flex-1">{webT("actions.preview")}</h3>
            {existingImportedProject.data ? (
              <>
                <ActionButton
                  onPress={() =>
                    importProject.mutate({
                      existing: existingImportedProject.data,
                    })
                  }
                >
                  {webT("share.overwrite")}
                </ActionButton>
                <ActionButton onPress={() => importProject.mutate({ existing: null, copy: true })}>
                  {webT("share.importCopy")}
                </ActionButton>
              </>
            ) : (
              <ActionButton onPress={() => importProject.mutate({ copy: true })}>{webT("actions.import")}</ActionButton>
            )}
          </div>
        )}
        <SharePreviewEditor manifest={queryString.resource} />
      </div>
    );
  }

  if (queryString.action === "import" && queryString.resource && queryString.projectId) {
    if (existingImportedProject.isLoading) {
      return <div>{webT("feedback.loading")}</div>;
    }

    if (existingImportedProject.data) {
      const project = existingImportedProject.data;
      // @todo
      return (
        <div className="w-full flex items-center justify-center bg-me-gray-300">
          <div className="max-w-xl w-full bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">{webT("share.exists")}</h3>
            <div>{webT("share.overwriteConfirm")}</div>
            <div className="flex gap-2 my-4">
              <ActionButton onPress={() => importProject.mutate({ existing: project })}>
                {webT("share.overwrite")}
              </ActionButton>
              <ActionButton onPress={() => importProject.mutate({ existing: null, copy: true })}>
                {webT("share.importCopy")}
              </ActionButton>
              <ActionButton onPress={() => setShouldPreview(true)}>{webT("actions.preview")}</ActionButton>
            </div>
            <a
              href={queryString.preset ? `/editor/${project.id}/${queryString.preset}` : `/editor/${project.id}`}
              target="_blank"
              className="text-me-primary-500 underline"
              rel="noreferrer"
            >
              {webT("share.viewExisting")}
            </a>
          </div>
        </div>
      );
    }

    return <div />;
  }

  if (!queryString.resource) {
    return <div>{webT("share.invalid")}</div>;
  }

  return (
    <div>
      <h3>{webT("share.choices")}</h3>
      {existingImportedProject.isLoading && <div>{webT("feedback.loading")}</div>}
      {existingImportedProject.data ? <div>{webT("share.existing")}</div> : <div>{webT("share.importNew")}</div>}
      <div>
        <button disabled={importProject.isPending} onClick={() => importProject.mutate({})}>
          {webT("actions.import")}
        </button>
        <button onClick={() => setShouldPreview(true)}>{webT("actions.preview")}</button>
      </div>
    </div>
  );
}
