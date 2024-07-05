"use client";
import { useMutation } from "@tanstack/react-query";
import { createBlankManifest, createBrowserProject, createManifestFromJson } from "./browser-state";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateFromUrlModal } from "./CreateFromUrlModal";
import { Toolbar, Button } from "react-aria-components";
import { fileOpen } from "browser-fs-access";
import { upgrade } from "@iiif/parser/upgrader";

export default function GettingStarted() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const blankManifest = useMutation({
    mutationFn: createBlankManifest,
    onSuccess: (data) => {
      if (data) {
        router.push(`/editor/${data.id}`);
      }
    },
  });

  const filesystemManifest = useMutation({
    mutationFn: async () => {
      const file = await fileOpen({ mimeTypes: ["json/*"], id: "iiif-manifest" });
      const text = await file.text();
      const json = JSON.parse(text);
      const upgraded = upgrade(json);
      if (!upgraded) {
        throw new Error("Invalid manifest");
      }
      return createManifestFromJson(upgraded, { fileName: file.name });
    },
    onSuccess: (data) => {
      if (data) {
        router.push(`/editor/${data.id}`);
      }
    },
  });

  return (
    <div className="bg-me-gray-100 py-8 px-6 border-b">
      <h2 className="text-2xl mb-6">Get started</h2>
      <Toolbar className="flex gap-3">
        <Button className="w-32 flex items-center flex-col group cursor-default" onPress={() => blankManifest.mutate()}>
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <AddIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">New manifest</div>
        </Button>
        <Button className="w-32 flex items-center flex-col group cursor-default" onPress={() => setIsModalOpen(true)}>
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <LinkIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Paste link</div>
        </Button>
        <Button
          className="w-32 flex items-center flex-col group cursor-default"
          onPress={() => filesystemManifest.mutate()}
        >
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <FileIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Open File</div>
        </Button>
      </Toolbar>
      <CreateFromUrlModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960" {...props}>
      <path
        d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 -960 960 960"
      {...props}
    >
      <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
    </svg>
  );
}

function AddIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 -960 960 960"
      {...props}
    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
}
