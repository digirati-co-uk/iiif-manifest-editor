// 1. List projects
// 2. Get project by ID

import { InternationalString } from "@iiif/presentation-3";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createStore, set, get, keys, del, delMany } from "idb-keyval";
import { useEffect, useMemo, useRef, useState } from "react";
import { queryClient } from "../site/Provider";
import { randomId } from "@manifest-editor/shell";
import { Vault, createThumbnailHelper } from "@iiif/helpers";

const localStore = createStore("manifest-editor-projects-v2", "manifest-editor-project-store");

export interface LocalBrowserProjectSnippet {
  id: string;
  resource: { id: string; type: string; label: InternationalString; thumbnail: string };
  extraData: any;
  updated: number;
}

export interface LocalBrowserProject {
  id: string;
  resource: { id: string; type: string; label: InternationalString; thumbnail: string };
  source: { id: string; type: string };
  vaultData: object;
  extraData: object;
  created: number;
  updated: number;
  isOpen: boolean;
  etag: string | null;
}

export async function listBrowserProjects(): Promise<LocalBrowserProjectSnippet[]> {
  const projectIds = await keys(localStore);
  const projects: LocalBrowserProjectSnippet[] = [];
  for (const projectId of projectIds) {
    const project = await get<LocalBrowserProject>(projectId, localStore);
    if (project) {
      projects.push({
        id: projectId as string,
        resource: project.resource,
        extraData: project.extraData,
        updated: project.updated,
      });
    }
  }
  return projects.sort((a, b) => b.updated - a.updated);
}

export async function internal_getBrowserProjectById(projectId: string): Promise<LocalBrowserProject | null> {
  return (await get(projectId, localStore)) || null;
}

export async function openBrowserProject(
  id: string
): Promise<{ project: LocalBrowserProject; wasAlreadyOpen: boolean }> {
  const current = await get<LocalBrowserProject>(id, localStore);
  if (!current) throw new Error("Project not found");
  const project = { ...current, isOpen: true };
  await set(id, project, localStore);
  return {
    project,
    wasAlreadyOpen: current.isOpen,
  };
}

export async function closeBrowserProject(id: string): Promise<LocalBrowserProject> {
  const current = await get<LocalBrowserProject>(id, localStore);
  if (!current) throw new Error("Project not found");
  const project = { ...current, isOpen: false };
  await set(id, project, localStore);
  return current;
}

export async function createBrowserProject(
  id: string,
  resource: LocalBrowserProject["resource"],
  source: LocalBrowserProject["source"],
  vaultData: LocalBrowserProject["vaultData"],
  extraData: LocalBrowserProject["extraData"]
): Promise<LocalBrowserProject> {
  const project: LocalBrowserProject = {
    id,
    resource,
    source,
    vaultData,
    extraData,
    created: Date.now(),
    updated: Date.now(),
    isOpen: false,
    etag: `etag_${Date.now()}`,
  };
  await set(id, project, localStore);
  return project;
}

export async function saveBrowserProjectResource(
  id: string,
  resource: LocalBrowserProject["resource"],
  etag: string
): Promise<string> {
  const current = await get<LocalBrowserProject>(id, localStore);
  if (!current) throw new Error("Project not found");
  if (!etag) throw new Error("etag is required");
  if (current.etag !== etag) throw new Error(`etag mismatch: ${current.etag} !== ${etag}`);
  const newEtag = `etag_${Date.now()}`;
  const project = { ...current, resource, updated: Date.now(), etag: newEtag };
  await set(id, project, localStore);
  return newEtag;
}

export async function saveBrowserProjectVaultData(id: string, data: object, etag: string): Promise<string> {
  const current = await get<LocalBrowserProject>(id, localStore);
  if (!current) throw new Error("Project not found");
  if (!etag) throw new Error("etag is required");
  if (current.etag !== etag) throw new Error(`etag mismatch: ${current.etag} !== ${etag}`);
  const newEtag = `etag_${Date.now()}`;
  const project = { ...current, vaultData: data, updated: Date.now(), etag: newEtag };
  await set(id, project, localStore);
  return newEtag;
}

export async function saveBrowserProjectExtraData(id: string, data: object, etag: string): Promise<string> {
  const current = await get<LocalBrowserProject>(id, localStore);
  if (!current) throw new Error("Project not found");
  if (!etag) throw new Error("etag is required");
  if (current.etag !== etag) throw new Error(`etag mismatch: ${current.etag} !== ${etag}`);
  const newEtag = `etag_${Date.now()}`;
  const newExtraData = { ...(current.extraData || {}), ...data };
  const project = { ...current, extraData: newExtraData, updated: Date.now(), etag: newEtag };
  await set(id, project, localStore);
  return newEtag;
}

export async function getLatestEtag(id: string): Promise<string | null> {
  const current = await get<LocalBrowserProject>(id, localStore);
  return current?.etag || null;
}

export async function deleteBrowserProject(id: string): Promise<void> {
  await del(id, localStore);
}

export async function deleteAllBrowserProjects(): Promise<void> {
  const projectIds = await keys(localStore);
  await delMany(projectIds, localStore);
}

export function useBrowserProject(id: string) {
  const etag = useRef<string | null>(null);
  const vault = useMemo(() => {
    console.log("new vault");
    return new Vault();
  }, [id]);
  useEffect(() => {
    setVaultReady(false);
  }, [vault]);
  const [staleEtag, setStaleEtag] = useState(true);
  const [vaultReady, setVaultReady] = useState(false);
  const {
    data: projectData,
    error,
    isError,
    isLoading,
    refetch: reopenProject,
  } = useQuery({
    queryFn: async () => {
      if (!id) throw new Error("id is required");
      const project = await openBrowserProject(id);
      vault.getStore().setState({ iiif: project.project.vaultData as any });
      setVaultReady(true);
      console.log("setting etag (1)", project.project.etag);
      etag.current = project.project.etag;
      setStaleEtag(false);
      console.log("wasAlreadyOpen", project.wasAlreadyOpen);
      return project;
    },
    queryKey: ["browser-project", id],
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const userForceUpdate = useMutation({
    mutationFn: async () => {
      const newEtag = await getLatestEtag(id);
      etag.current = newEtag;
    },
    mutationKey: ["force-reopen-browser-project", id],
  });

  const saveExtraData = useMutation({
    mutationFn: async (data: object, force = false) => {
      if (force) etag.current = await getLatestEtag(id);
      if (!projectData) throw new Error("project not loaded");
      if (!etag.current) throw new Error("etag not set");
      const newEtag = await saveBrowserProjectExtraData(id, data, etag.current!);
      console.log("setting etag (3)", newEtag);
      etag.current = newEtag;
      queryClient.setQueryData(["browser-project", id], {
        project: { ...projectData.project, extraData: data },
        wasAlreadyOpen: projectData.wasAlreadyOpen,
      });
    },
    onError: (error) => {
      console.log("error", error);
      setStaleEtag(true);
    },
    mutationKey: ["save-browser-project-extra-data", id],
  });

  const saveResource = useMutation({
    mutationFn: async (data: LocalBrowserProject["resource"], force = false) => {
      if (force) etag.current = await getLatestEtag(id);
      if (!projectData) throw new Error("project not loaded");
      if (!etag.current) throw new Error("etag not set");
      const newEtag = await saveBrowserProjectResource(id, data, etag.current!);
      console.log("setting etag (4)", newEtag);
      etag.current = newEtag;
      queryClient.setQueryData(["browser-project", id], {
        project: { ...projectData.project, resource: data },
        wasAlreadyOpen: projectData.wasAlreadyOpen,
      });
    },
    onError: (error) => {
      console.log("error", error);
      setStaleEtag(true);
    },
    mutationKey: ["save-browser-project-resource", id],
  });

  const saveVaultData = useMutation({
    mutationFn: async (force: boolean = false) => {
      if (force) etag.current = await getLatestEtag(id);
      if (!projectData) throw new Error("project not loaded");
      if (!etag.current) throw new Error("etag not set");
      const data = vault.getState().iiif;

      const manifests = Object.keys(data.entities.Manifest || {});
      const collections = Object.keys(data.entities.Manifest || {});

      if (manifests.length + collections.length === 0) {
        // Ignore empty vaults.
        return;
      }

      etag.current = await saveBrowserProjectVaultData(id, data, etag.current!);
      queryClient.setQueryData(["browser-project", id], {
        project: { ...projectData.project, vaultData: data },
        wasAlreadyOpen: projectData.wasAlreadyOpen,
      });
    },
    onError: (error) => {
      console.log("error", error);
      setStaleEtag(true);
    },
    mutationKey: ["save-browser-project-vault-data", id],
  });

  const closeProject = useMutation({
    mutationFn: async () => {
      try {
        await saveVaultData.mutateAsync(false);
      } catch (e) {}
      await closeBrowserProject(id);
    },
    onSuccess: async () => {
      // etag.current = null;
    },
    mutationKey: ["close-browser-project", id],
  });

  useEffect(() => {
    return () => {
      closeProject.mutate();
    };
  }, []);

  // Before the window closes.
  useEffect(() => {
    window.addEventListener("beforeunload", async (e) => {
      console.log("closing project");
      await closeProject.mutateAsync();
    });
  }, []);

  console.log("etag", etag.current);

  return {
    staleEtag,
    vault,
    vaultReady,
    projectError: error,
    isProjectLoading: isLoading,
    isProjectError: isError,
    wasAlreadyOpen: projectData?.wasAlreadyOpen,
    project: projectData?.project,
    saveExtraData,
    saveResource,
    saveVaultData,
    closeProject,
    reopenProject,
    userForceUpdate,
  };
}

export async function createBlankManifest() {
  const id = randomId();
  const manifest = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: `https://example.org/${id}`,
    type: "Manifest",
    label: {
      en: ["Blank Manifest"],
    },
    items: [],
  };

  const vault = new Vault();
  vault.loadManifestSync(manifest.id, manifest);
  const vaultData = vault.getState().iiif;

  const project = await createBrowserProject(
    id,
    {
      id: manifest.id,
      type: "Manifest",
      label: { en: ["Blank Manifest"] },
      thumbnail: "",
    },
    { id: "blank-manifest", type: "Template" },
    vaultData,
    {}
  );

  return project;
}

export async function createManifestFromId(url: string) {
  const id = randomId();
  const vault = new Vault();
  const manifest = await vault.loadManifest(url);

  if (!manifest) throw new Error("Manifest not found");

  const vaultData = vault.getState().iiif;

  const thumbnailHelper = createThumbnailHelper(vault);
  const thumbnail = await thumbnailHelper.getBestThumbnailAtSize(
    manifest,
    {
      width: 256,
      height: 256,
    },
    true
  );
  const thumb = thumbnail?.best?.id;

  const project = await createBrowserProject(
    id,
    {
      id: manifest.id,
      type: "Manifest",
      label: manifest.label || { en: ["Untitled manifest"] },
      thumbnail: thumb || "",
    },
    { id: url, type: "Template" },
    vaultData,
    {}
  );

  return project;
}
