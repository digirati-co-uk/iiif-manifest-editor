"use client";

import { createThumbnailHelper, Vault } from "@iiif/helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SharePreviewEditor } from "./SharePreviewEditor";
import {
  internal_getBrowserProjectById,
  createManifestFromId,
  saveBrowserProjectVaultData,
  getLatestEtag,
  LocalBrowserProject,
} from "../browser-editor/browser-state";
import { useRouter } from "next/navigation";
import { CanvasNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { ActionButton } from "@manifest-editor/components";

export default function SharePage() {
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
          const newResource = await vault.load<ManifestNormalized | CanvasNormalized>(queryString.resource);
          if (!newResource) throw new Error("Invalid resource");
          const data = vault.getState().iiif;
          const manifests = Object.keys(data.entities.Manifest || {});
          const collections = Object.keys(data.entities.Manifest || {});

          if (manifests.length + collections.length === 0) {
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

        return await createManifestFromId(queryString.resource, {
          imported: true,
          originalProjectId: queryString.projectId,
          projectId: copy ? undefined : queryString.projectId,
        });
      }
      return await createManifestFromId(queryString.resource, { imported: true });
    },
    onSuccess: (data) => {
      if (data) {
        router.push(`/editor/${data.id}`);
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
    const action = params.get("action") as null | "import" | "preview";
    const tab = params.get("selected-tab") as null;

    return {
      resource,
      projectId,
      action: action,
      state: {
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

  if ((shouldPreview || queryString.action === "preview") && queryString.resource) {
    return (
      <div className="flex flex-col flex-1">
        {queryString.action === "preview" ? (
          <div className="bg-me-primary-100 p-4 text-center flex gap-4 items-center">
            <div>Previewing the project</div>
            <ActionButton onPress={() => importProject.mutate({ copy: true })}>Make a copy</ActionButton>
          </div>
        ) : (
          <div className="bg-me-primary-100 p-4 text-center flex gap-4 items-center">
            <ActionButton onPress={() => setShouldPreview(false)}>Back</ActionButton>
            <h3 className="text-lg font-semibold flex-1">Preview</h3>
            {existingImportedProject.data ? (
              <>
                <ActionButton onPress={() => importProject.mutate({ existing: existingImportedProject.data })}>
                  Overwrite and import
                </ActionButton>
                <ActionButton onPress={() => importProject.mutate({ existing: null, copy: true })}>
                  Import a copy
                </ActionButton>
              </>
            ) : (
              <ActionButton onPress={() => importProject.mutate({ copy: true })}>Import</ActionButton>
            )}
          </div>
        )}
        <SharePreviewEditor manifest={queryString.resource} />
      </div>
    );
  }

  if (queryString.action === "import" && queryString.resource && queryString.projectId) {
    if (existingImportedProject.isLoading) {
      return <div>Loading...</div>;
    }

    if (existingImportedProject.data) {
      const project = existingImportedProject.data;
      // @todo
      return (
        <div className="w-full flex items-center justify-center bg-me-gray-300">
          <div className="max-w-xl w-full bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Project already exists</h3>
            <div>Do you want to overwrite existing project?</div>
            <div className="flex gap-2 my-4">
              <ActionButton onPress={() => importProject.mutate({ existing: project })}>
                Overwrite and import
              </ActionButton>
              <ActionButton onPress={() => importProject.mutate({ existing: null, copy: true })}>
                Import a copy
              </ActionButton>
              <ActionButton onPress={() => setShouldPreview(true)}>Preview</ActionButton>
            </div>
            <a href={`/editor/${project.id}`} target="_blank" className="text-me-primary-500 underline">
              View existing project
            </a>
          </div>
        </div>
      );
    }

    return <div />;
  }

  if (!queryString.resource) {
    return <div>Invalid query</div>;
  }

  return (
    <div>
      <h3>Choices for the user</h3>
      {existingImportedProject.isLoading && <div>Loading...</div>}
      {existingImportedProject.data ? <div>Existing project</div> : <div>Import new project</div>}
      <div>
        <button disabled={importProject.isPending} onClick={() => importProject.mutate({})}>
          Import
        </button>
        <button onClick={() => setShouldPreview(true)}>Preview</button>
      </div>
    </div>
  );
}
