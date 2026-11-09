import { useTranslations } from "@manifest-editor/i18n";
/* eslint-disable next/no-img-element -- External IIIF thumbnails in a shared React library. */
import { getValue } from "@iiif/helpers";
import { BackgroundActionMenuButton, IIIFBrowserIcon, IIIFBrowserI18nProvider } from "@manifest-editor/components";
import { useManifest } from "react-iiif-vault";
import styled from "styled-components";
import type { IIIFBrowserProps } from "iiif-browser";
import type { NotebookStore } from "iiif-browser/notebook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { IIIFNotebook, notebookPlugin, notebookResourceHistory, type NotebookResource } from "iiif-browser/notebook";
import { useAppResourceInstance } from "../AppResourceProvider/AppResourceProvider";
import { useConfig } from "../ConfigContext/ConfigContext";
import { useLayoutActions, useLayoutState } from "../Layout/Layout.context";
import { PreviewVaultBoundary, usePreviewVault } from "../PreviewVault/PreviewVault";
import {
  ensureProjectNote,
  getProjectNotebook,
  notebookResourceInput,
  projectNotebookSources,
  seedProjectNotebook,
} from "./notebook";

export const NOTEBOOK_PANEL_ID = "@manifest-editor/notebook";

export function NotebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M6 15.325q.35-.175.725-.25T7.5 15H8V4h-.5q-.625 0-1.062.438T6 5.5zM10 15h8V4h-8zm-4 .325V4zM7.5 22q-1.45 0-2.475-1.025T4 18.5v-13q0-1.45 1.025-2.475T7.5 2H18q.825 0 1.413.587T20 4v12.525q0 .2-.162.363t-.588.362q-.35.175-.55.5t-.2.75t.2.763t.55.487t.55.413t.2.562v.25q0 .425-.288.725T19 22zm0-2h9.325q-.15-.35-.237-.712T16.5 18.5q0-.4.075-.775t.25-.725H7.5q-.65 0-1.075.438T6 18.5q0 .65.425 1.075T7.5 20"
      />
    </svg>
  );
}

export function useProjectNotebook(): { notebook: NotebookStore; projectId: string; enabled: boolean } {
  const instanceId = useAppResourceInstance();
  const config = useConfig().notebook;
  const projectId = config?.projectId ?? instanceId;
  const notebook = useMemo(() => getProjectNotebook(projectId), [projectId]);
  return { notebook, projectId, enabled: !!config?.enabled };
}

/** Mounted once by the shell, so host callbacks run once for each edit. */
export function ProjectNotebookSync() {
  const { notebook, projectId, enabled } = useProjectNotebook();
  const config = useConfig().notebook;
  useEffect(() => {
    if (!enabled || !config) return;
    const unsubscribe = notebook.subscribe((state, previous) => {
      if (state.notes !== previous.notes) config.onChange?.(state.notes, projectId);
    });
    seedProjectNotebook(notebook, projectId, config);
    return unsubscribe;
  }, [notebook, projectId, config, enabled]);
  return null;
}

export function useNotebookBrowserPlugins(): NonNullable<IIIFBrowserProps["plugins"]> {
  const { notebook, projectId, enabled } = useProjectNotebook();
  return useMemo(() => (enabled ? [notebookPlugin({ notebook, projectId })] : []), [notebook, projectId, enabled]);
}

export function ProjectNotebookHeader() {
  const config = useConfig();
  if (!config.notebook?.enabled) return null;
  return (
    <div className="flex justify-end p-2">
      <ProjectNotebookButton />
    </div>
  );
}

export function ProjectNotebookButton() {
  const t = useTranslations("shell");

  const config = useConfig();
  const actions = useLayoutActions();
  const state = useLayoutState();
  if (!config.notebook?.enabled) return null;
  const isOpen = state.leftPanel.current === NOTEBOOK_PANEL_ID && state.leftPanel.open;
  return (
    <BackgroundActionMenuButton
      title={t("notebook.hint")}
      aria-label={t("notebook.title")}
      aria-expanded={isOpen}
      active={isOpen}
      onClick={() => (isOpen ? actions.leftPanel.close() : actions.leftPanel.open({ id: NOTEBOOK_PANEL_ID }))}
    >
      <NotebookIcon />
    </BackgroundActionMenuButton>
  );
}

// The browser still offers its full notebook workspace. This mount is deliberately a single page.
const SidebarNotebook = styled(IIIFNotebook)`
  font-family: inherit;
  .iiif-notebook__sidebar,
  .iiif-notebook__resize,
  .iiif-notebook__title-row {
    display: none;
  }
  .iiif-notebook__main {
    padding: 0 16px;
  }
  .iiif-notebook__toolbar {
    padding: 6px 0;
  }
  .iiif-notebook__prose {
    font-size: 14px;
    line-height: 1.65;
    padding-bottom: 40px;
  }
`;

export function ProjectNotebookPanel() {
  const t = useTranslations("shell");

  const { notebook, projectId } = useProjectNotebook();
  const config = useConfig().notebook;
  const manifest = useManifest();
  const contentTitle = getValue(manifest?.label);
  const title = contentTitle || t("notebook.untitled");
  const vault = usePreviewVault();
  const [noteId, setNoteId] = useState<string>();
  const { create } = useLayoutActions();
  const onOpenResource = useCallback(
    (resource: NotebookResource) => {
      if (!manifest) return;
      const url = notebookResourceInput(resource);
      const historyResource = resource.type === "ImageService" ? { ...resource, id: url } : resource;
      void create({
        type: "Canvas",
        isPainting: true,
        parent: { id: manifest.id, type: "Manifest" },
        property: "items",
        initialCreator: config?.browserCreatorId ?? "@manifest-editor/iiif-browser-creator",
        initialData: { url, iiifBrowserOptions: { history: notebookResourceHistory(historyResource) } },
      });
    },
    [create, manifest, config?.browserCreatorId]
  );
  useEffect(() => {
    setNoteId(
      ensureProjectNote(notebook, projectId, contentTitle || "Untitled manifest", config?.initialNotes?.[0]?.id)
    );
    notebook.getState().setWorkspaceView(projectId, { sidebarCollapsed: true });
  }, [notebook, projectId, contentTitle, config?.initialNotes]);
  return (
    <PreviewVaultBoundary>
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="m-0 text-base font-medium leading-snug text-gray-800">{title}</h2>
          <p className="mb-0 mt-1 text-xs leading-relaxed text-gray-500">{t("notebook.description")}</p>
        </div>
        <div className="min-h-0 flex-1">
          {noteId ? (
            <IIIFBrowserI18nProvider>
              <SidebarNotebook
                notebook={notebook}
                projectId={projectId}
                noteId={noteId}
                height="100%"
                defaultSidebarCollapsed
                className="manifest-project-notebook"
                browserProps={{ vault }}
                onOpenResource={onOpenResource}
              />
            </IIIFBrowserI18nProvider>
          ) : null}
        </div>
      </div>
    </PreviewVaultBoundary>
  );
}

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function NotebookCreatorSources({
  onSelect,
  isDisabled,
  onOpenNotebook,
}: {
  onSelect: (url: string) => void;
  isDisabled: boolean;
  onOpenNotebook?: () => void;
}) {
  const t = useTranslations("shell");

  const { notebook, projectId, enabled } = useProjectNotebook();
  const notes = useStore(notebook, (state) => state.notes);
  const sources = useMemo(() => projectNotebookSources(notes, projectId), [notes, projectId]);
  if (!enabled || !sources.length) return null;
  return (
    <section aria-label={t("notebook.saved")} className="mt-4">
      <h3 className="mb-1 text-xs font-medium text-gray-500">{t("notebook.saved")}</h3>
      <div className="flex flex-col">
        {sources.length > 4 && onOpenNotebook ? (
          <button
            type="button"
            disabled={isDisabled}
            onClick={onOpenNotebook}
            className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm text-me-primary-500 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-me-primary-500 disabled:opacity-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              <IIIFBrowserIcon className="h-5 w-5" />
            </span>
            {t("notebook.viewAll", { count: sources.length })}
          </button>
        ) : null}
        {sources.slice(0, 4).map((source) => (
          <button
            key={source.url}
            type="button"
            disabled={isDisabled}
            title={source.url}
            className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-me-primary-500 disabled:opacity-50"
            onClick={() => onSelect(source.url)}
          >
            {source.thumbnail ? (
              <img src={source.thumbnail} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-50 text-gray-400">
                <NotebookIcon className="h-4 w-4" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm text-gray-700">{source.label}</span>
              <span className="block truncate text-xs text-gray-400">
                {sourceHost(source.url)}
                {source.noteTitle ? ` · ${source.noteTitle}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
