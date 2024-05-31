"use client";
import { useQuery } from "@tanstack/react-query";
import "manifest-editor/dist/index.css";
import { listBrowserProjects } from "./browser-state";
import { LocaleString } from "react-iiif-vault";
import Link from "next/link";

export default function BrowserRecents() {
  const projects = useQuery({
    queryKey: ["browser-projects"],
    queryFn: listBrowserProjects,
  });

  return (
    <div className="flex gap-4">
      {projects.data &&
        projects.data.map((project) => (
          <Link className="underline" key={project.id} href={`/editor/${project.id}`}>
            <div className="w-64 border flex flex-col">
              <div className="bg-gray-300 w-full h-48"></div>
              <LocaleString className="p-3 text-center w-full">{project.resource.label}</LocaleString>
            </div>
          </Link>
        ))}
    </div>
  );
}
