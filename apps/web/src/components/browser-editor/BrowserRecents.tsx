"use client";
import { useQuery } from "@tanstack/react-query";
import "manifest-editor/dist/index.css";
import { deleteBrowserProject, listBrowserProjects } from "./browser-state";
import { LocaleString } from "react-iiif-vault";
import Link from "next/link";
import { Button, Dialog, DialogTrigger, Popover, TabListStateContext } from "react-aria-components";
import { queryClient } from "../site/Provider";
import { useContext, useEffect } from "react";

export default function BrowserRecents() {
  const { selectionManager } = useContext(TabListStateContext) || {};

  const projects = useQuery({
    queryKey: ["browser-projects"],
    queryFn: listBrowserProjects,
  });

  useEffect(() => {
    if (projects.isFetched && selectionManager) {
      if (!projects.data || !projects.data.length) {
        selectionManager.select("examples");
      }
    }
  }, [projects.data]);

  return (
    <div className="grid grid-md gap-4">
      {projects.data &&
        projects.data.map((project) => (
          <div className="relative" key={project.id}>
            <ProjectContextualMenu id={project.id} />
            <Link href={`/editor/${project.id}`}>
              <div className="border flex flex-col rounded hover:border-me-primary-500 overflow-hidden">
                <div className="bg-gray-200 w-full h-48 transition-transform">
                  {project.resource.thumbnail ? (
                    <img src={project.resource.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/40">No thumbnail</div>
                  )}
                </div>
                <LocaleString className="underline p-3  text-sm text-center w-full h-20 flex items-center justify-center overflow-hidden text-ellipsis">
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

  return (
    <DialogTrigger>
      <Button className="bg-me-gray-700/50 text-white/80 hover:text-white absolute right-2 top-2 p-0.5 text-2xl rounded-full">
        <MoreIcon />
      </Button>
      <Popover placement="bottom left">
        <Dialog className="bg-white/95 p-0.5 shadow-md rounded-md animate-fadeIn w-36 flex flex-col items-start gap-1 focus:outline-none text-sm border border-[#000] border-opacity-10 backdrop-blur">
          <Link
            className="w-full hover:bg-me-primary-100/50 rounded py-1 px-2 focus-visible:bg-me-primary-100/50"
            href={`/editor/${id}`}
          >
            Open
          </Link>
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
