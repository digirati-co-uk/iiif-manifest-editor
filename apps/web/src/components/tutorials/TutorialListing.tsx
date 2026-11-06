"use client";

import { useTranslations, useEditorI18n } from "@manifest-editor/i18n";

/* eslint-disable next/no-img-element -- Tutorial thumbnails are external IIIF resources. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createNotebookProject, listBrowserProjects } from "../browser-editor/browser-state";
import { NOTEBOOK_PANEL_ID } from "@manifest-editor/shell";
import { tutorials, type Tutorial } from "./tutorials";

export function TutorialListing() {
  const webT = useTranslations("web");
  const i18n = useEditorI18n();

  const router = useRouter();
  const queryClient = useQueryClient();
  const projects = useQuery({ queryKey: ["browser-projects"], queryFn: listBrowserProjects });
  const openProject = (id: string) => router.push(`/editor/${id}?leftPanel=${encodeURIComponent(NOTEBOOK_PANEL_ID)}`);
  const start = useMutation({
    mutationFn: (tutorial: Tutorial) =>
      createNotebookProject({
        markdown: i18n.resolveMessage(tutorial.messages?.markdown, tutorial.markdown),
        noteTitle: i18n.resolveMessage(tutorial.messages?.title, tutorial.title),
        noteId: tutorial.id,
        source: { id: tutorial.source.url, type: "Tutorial" },
        extraData: { tutorial: { id: tutorial.id, title: tutorial.title, source: tutorial.source } },
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["browser-projects"] });
      openProject(project.id);
    },
  });

  return (
    <div className="pb-10">
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-gray-600">{webT("tutorials.intro")}</p>
      {start.error || projects.isError ? (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {webT("tutorials.failed")}
        </p>
      ) : null}
      <div className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => {
          const project = projects.data?.find((project) => project.extraData?.tutorial?.id === tutorial.id);
          return (
            <article
              key={tutorial.id}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm"
            >
              <div className="flex h-40 items-center justify-center border-b border-gray-100 bg-gray-50 p-4">
                {tutorial.thumbnail ? (
                  <img
                    src={tutorial.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="mb-2 text-xs text-gray-500">
                  {webT("tutorials.duration", {
                    duration: i18n.resolveMessage(tutorial.messages?.duration, tutorial.duration),
                  })}
                </p>
                <h2 className="mb-2 text-lg font-medium text-gray-900">
                  {i18n.resolveMessage(tutorial.messages?.title, tutorial.title)}
                </h2>
                {project ? (
                  <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-600">
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    {webT("tutorials.started")}
                  </p>
                ) : null}
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {i18n.resolveMessage(tutorial.messages?.description, tutorial.description)}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={start.isPending || projects.isPending || projects.isError}
                    aria-busy={start.isPending && start.variables?.id === tutorial.id}
                    onClick={() => (project ? openProject(project.id) : start.mutate(tutorial))}
                    className="rounded-md bg-me-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-me-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-me-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {start.isPending && start.variables?.id === tutorial.id
                      ? webT("tutorials.starting")
                      : project
                        ? webT("tutorials.continue")
                        : webT("tutorials.start")}
                  </button>
                  <a
                    href={tutorial.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                  >
                    {webT("tutorials.recipe")}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
