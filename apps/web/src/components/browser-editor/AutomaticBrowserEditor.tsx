"use client";

import { useTranslations } from "@manifest-editor/i18n";

import { internal_getBrowserProjectById } from "./browser-state";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const BrowserManifestEditor = dynamic(() => import("./BrowserManifestEditor"));
const BrowserCollectionEditor = dynamic(() => import("./BrowserCollectionEditor"));

export default function AutomaticBrowserEditor({ id, layoutMode }: { id: string; layoutMode?: "default" | "focused" }) {
  const webT = useTranslations("web");

  const { data: project, isPending } = useQuery({
    queryKey: ["project_internal", id],
    queryFn: () => internal_getBrowserProjectById(id),
  });

  if (isPending) return <output>{webT("feedback.loading")}</output>;

  if (project?.resource.type === "Manifest") {
    return <BrowserManifestEditor id={id} layoutMode={layoutMode} />;
  }

  if (project?.resource.type === "Collection") {
    return <BrowserCollectionEditor id={id} layoutMode={layoutMode} />;
  }

  return <div>{webT("feedback.unknown")}</div>;
}
