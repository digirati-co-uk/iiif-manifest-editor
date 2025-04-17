"use client";

import { internal_getBrowserProjectById } from "./browser-state";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";


const BrowserManifestEditor = dynamic(() => import('./BrowserManifestEditor'));
const BrowserCollectionEditor = dynamic(() => import('./BrowserCollectionEditor'));

export default function AutomaticBrowserEditor({ id }: { id: string }) {
  const { data: project } = useQuery({ queryKey: ['project_internal', id], queryFn: () => internal_getBrowserProjectById(id) })

  if (project?.resource.type === 'Manifest') {
    return <BrowserManifestEditor id={id} />
  }

  if (project?.resource.type === 'Collection') {
    return <BrowserCollectionEditor id={id} />
  }

  return <div>Unknown error</div>;
}
