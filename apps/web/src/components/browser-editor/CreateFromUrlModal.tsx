import { useTranslations } from "@manifest-editor/i18n";
import { Modal } from "@manifest-editor/components";
import { analyse } from "@manifest-editor/shell";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useLayoutEffect, useRef } from "react";
import { createCollectionFromId, createManifestFromId } from "./browser-state";

export function CreateFromUrlModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const webT = useTranslations("web");

  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const create = useMutation({
    mutationFn: analyse,
    onSuccess: (data) => {
      if (!data) return;

      if (data.type === "Manifest") {
        createProject.mutate(data);
        posthog.capture("manifest-imported", { manifest_id: data.id });
      }

      if (data.type === "Collection") {
        createCollectionProject.mutate(data);
      }
    },
  });

  const createProject = useMutation({
    mutationFn: createManifestFromId,
    onSuccess: (data) => {
      router.push(`/editor/${data.id}`);
    },
  });

  const createCollectionProject = useMutation({
    mutationFn: createCollectionFromId,
    onSuccess: (data) => {
      router.push(`/editor/${data.id}`);
    },
  });

  useLayoutEffect(() => {
    if (isOpen) {
      input.current?.focus();
    }
  }, [isOpen]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get("iiif-manifest") as string;
    if (!url) return;
    create.mutate(url);
  }

  return (
    <Modal open={isOpen} title={webT("import.urlTitle")} onClose={() => setIsOpen(false)}>
      <div className="p-6 mb-8">
        <div className="text-sm text-black/70 mb-4">{webT("import.urlHelp")}</div>

        <form className="flex gap-4" onSubmit={onSubmit}>
          <input
            ref={input}
            name="iiif-manifest"
            id="iiif-manifest"
            type="text"
            className="flex-1 border-b bg-me-gray-100 p-3"
            placeholder={webT("import.urlPlaceholder")}
            aria-label={webT("import.urlPlaceholder")}
            disabled={create.isPending || createProject.isPending || createCollectionProject.isPending}
            autoComplete="on"
          />
          <button
            type="submit"
            disabled={create.isPending || createProject.isPending || createCollectionProject.isPending}
            className="rounded-md bg-me-primary-500 hover:bg-me-primary-600 text-white px-8 disabled:bg-me-gray-700"
          >
            {webT("actions.open")}
          </button>
        </form>

        {(create.isPending || createProject.isPending || createCollectionProject.isPending) && (
          <div className="text-black/70 mt-4">{webT("import.opening")}</div>
        )}

        {((create.isSuccess && !create.data) ||
          create.isError ||
          createProject.isError ||
          createCollectionProject.isError) && (
          <div role="alert" className="text-[red] mt-4">
            {webT("import.failed")}
          </div>
        )}

        {create.data && create.data.type !== "Manifest" && create.data.type !== "Collection" && (
          <div role="alert" className="text-[red] mt-4">
            {webT("import.invalidType")}
          </div>
        )}
      </div>
    </Modal>
  );
}
