"use client";
// import "manifest-editor/dist/index.css";
import { Vault } from "@iiif/helpers";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { LocaleString } from "react-iiif-vault";
import { queryClient } from "../site/Provider";
import { deleteBrowserProject, internal_getBrowserProjectById, listBrowserProjects } from "./browser-state";

export default function BrowserRecents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projects = useQuery({
    queryKey: ["browser-projects"],
    queryFn: listBrowserProjects,
  });

  useEffect(() => {
    if (projects.isFetched) {
      const newTab = !projects.data || !projects.data.length ? "examples" : "recent";
      if (searchParams.get("tab") !== newTab) {
        router.replace(`?tab=${newTab}`, { scroll: false });
      }
    }
  }, [projects.isFetched, projects.data]);

  return (
    <div className="grid grid-md gap-4">
      {projects.data?.map((project) => (
        <div className="relative" key={project.id}>
          <ProjectContextualMenu id={project.id} />
          <Link href={`/editor/${project.id}${project.resource.preset ? `/${project.resource.preset}` : ""}`}>
            <div className="border flex flex-col rounded hover:border-me-primary-500 overflow-hidden">
              <div className="bg-gray-200 w-full h-48 transition-transform">
                {project.resource.thumbnail ? (
                  <img src={project.resource.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/40">No thumbnail</div>
                )}
              </div>
              <LocaleString className="underline p-3 text-sm text-center w-full h-20 flex items-center justify-center overflow-hidden text-ellipsis">
                {project.resource.label}
              </LocaleString>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

function MoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="#5f6368" viewBox="0 -960 960 960" {...props}>
      <path
        d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProjectContextualMenu({ id }: { id: string }) {
  function doDelete() {
    const confirmed = confirm("Are you sure you want to delete this project?");
    if (confirmed) {
      deleteBrowserProject(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ["browser-projects"] });
      });
    }
  }

  async function doDownload() {
    const project = await internal_getBrowserProjectById(id);
    if (project) {
      const fullData = JSON.stringify(project, null, 2);
      // Do download
      const blob = new Blob([fullData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `me-${project.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function doDownloadManifest() {
    const project = await internal_getBrowserProjectById(id);
    if (project) {
      const vault = new Vault();
      vault.getStore().setState({ iiif: project.vaultData as any });
      const item = vault.get(project.resource);
      const manifestJson = vault.toPresentation3(item);
      const fullData = JSON.stringify(manifestJson, null, 2);
      // Do download
      const blob = new Blob([fullData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manifest-${project.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <DialogTrigger>
      <Button className="bg-me-gray-700/50 text-white/80 hover:text-white absolute right-2 top-2 p-0.5 text-2xl rounded-full">
        <MoreIcon />
      </Button>
      <Popover placement="bottom left">
        <Dialog className="bg-white/95 p-0.5 shadow-md rounded-md animate-fadeIn w-44 flex flex-col items-start gap-1 focus:outline-none text-sm border border-[#000] border-opacity-10 backdrop-blur">
          <Link
            className="w-full hover:bg-me-primary-100/50 rounded py-1 px-2 focus-visible:bg-me-primary-100/50"
            href={`/editor/${id}`}
          >
            Open
          </Link>
          <Button
            className="w-full hover:bg-me-primary-100/50 rounded py-1 px-2 focus-visible:bg-me-primary-100/50 text-left"
            onPress={doDownloadManifest}
          >
            Download
          </Button>
          <Button
            className="w-full hover:bg-me-primary-100/50 rounded py-1 px-2 focus-visible:bg-me-primary-100/50 text-left"
            onPress={doDownload}
          >
            Debug download
          </Button>
          <Button
            className="w-full hover:bg-me-primary-100/50 rounded py-1 px-2 focus-visible:bg-me-primary-100/50 text-left"
            onPress={doDelete}
          >
            Delete
          </Button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
