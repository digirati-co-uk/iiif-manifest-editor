"use client";
import { upgrade } from "@iiif/parser/upgrader";
import { IIIFBrowserIcon, Modal } from "@manifest-editor/components";
import { useMutation } from "@tanstack/react-query";
import { fileOpen } from "browser-fs-access";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { Button, Dialog, DialogTrigger, Toolbar } from "react-aria-components";
import {
  createBlankCollection,
  createBlankExhibition,
  createBlankManifest,
  createManifestFromJson,
} from "./browser-state";
import { CreateFromUrlModal } from "./CreateFromUrlModal";
import { IIIFBrowserModal } from "./IIIFBrowserModal";

export default function GettingStarted() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIIIFBrowserOpen, setIsIIIFBrowserOpen] = useState(false);
  const blankManifest = useMutation({
    mutationFn: createBlankManifest,
    onSuccess: (data) => {
      if (data) {
        posthog.capture("blank-manifest-created", {});
        router.push(`/editor/${data.id}`);
      }
    },
  });

  const blankCollection = useMutation({
    mutationFn: createBlankCollection,
    onSuccess: (data) => {
      if (data) {
        posthog.capture("blank-collection-created", {});
        router.push(`/editor/${data.id}`);
      }
    },
  });

  const blankExhibition = useMutation({
    mutationFn: createBlankExhibition,
    onSuccess: (data) => {
      if (data) {
        posthog.capture("blank-exhibition-created", {});
        router.push(`/editor/${data.id}/exhibition`);
      }
    },
  });

  const filesystemManifest = useMutation({
    mutationFn: async () => {
      const file = await fileOpen({
        mimeTypes: ["json/*"],
        id: "iiif-manifest",
      });
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
    <div className="bg-me-gray-100 pb-8 pt-4 px-6 border-b">
      <h2 className="text-lg mb-3">Get started</h2>
      <Toolbar className="flex gap-3">
        <Button className="w-36 flex items-center flex-col group cursor-default" onPress={() => blankManifest.mutate()}>
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <AddIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Create new manifest</div>
        </Button>
        <Button className="w-36 flex items-center flex-col group cursor-default" onPress={() => setIsModalOpen(true)}>
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <LinkIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Open manifest URL</div>
        </Button>
        <Button
          className="w-36 flex items-center flex-col group cursor-default"
          onPress={() => filesystemManifest.mutate()}
        >
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <FileIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Open manifest file</div>
        </Button>

        <Button
          className="w-36 flex items-center flex-col group cursor-default"
          onPress={() => setIsIIIFBrowserOpen(true)}
        >
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <IIIFBrowserIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Browse for IIIF</div>
        </Button>
        <Button
          className="w-36 flex items-center flex-col group cursor-default"
          onPress={() => blankCollection.mutate()}
        >
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <CollectionIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Create Collection</div>
        </Button>
        <Button
          className="w-36 flex items-center flex-col group cursor-default"
          onPress={() => blankExhibition.mutate()}
        >
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-36 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white/70 group-hover:text-white text-2xl">
              <AddIcon />
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Create Exhibition</div>
        </Button>
      </Toolbar>
      <CreateFromUrlModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      <IIIFBrowserModal isOpen={isIIIFBrowserOpen} setIsOpen={setIsIIIFBrowserOpen} />
    </div>
  );
}

function CollectionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 -960 960 960"
      aria-label="collection"
      role="img"
      {...props}
    >
      <path
        d="M320-320h480v-480h-80v280l-100-60-100 60v-280H320v480Zm0 80q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm360-720h200-200Zm-200 0h480-480Z"
        fill="currentColor"
      />
    </svg>
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
