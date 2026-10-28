import { useTranslations } from "@manifest-editor/i18n";
import { LocalizedIIIFBrowser, Modal } from "@manifest-editor/components";
import { useMutation } from "@tanstack/react-query";
import { type IIIFBrowserProps } from "iiif-browser";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useMemo, useRef } from "react";
import { VaultProvider } from "react-iiif-vault";
import { createManifestFromId } from "./browser-state";

export function IIIFBrowserModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) {
  const webT = useTranslations("web");

  const router = useRouter();
  const createProject = useMutation({
    mutationFn: createManifestFromId,
    onSuccess: (data) => {
      router.push(`/editor/${data.id}`);
      posthog.capture("manifest-imported", {
        manifest_id: data.id,
        fromIIIFBrowser: true,
      });
    },
  });

  const navigationOptions = useMemo(() => {
    return {
      canSelectCanvas: false,
      canSelectCollection: false,
      canSelectManifest: true,
      canCropImage: false,
      alwaysShowNavigationArrow: false,
      multiSelect: false,
    } as IIIFBrowserProps["navigation"];
  }, []);

  const { mutate: openManifest } = createProject;
  const live = useRef({ webT, openManifest });
  live.current = { webT, openManifest };
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        cb: (url: string) => live.current.openManifest(url),
        // Browser output descriptors are retained; resolve wording at display time.
        get label() {
          return live.current.webT("browser.openManifest");
        },
        supportedTypes: ["Manifest"],
        format: { type: "url" },
      },
    ] as IIIFBrowserProps["output"];
  }, [live]);

  if (createProject.isPending) {
    return (
      <Modal open={isOpen} title={webT("browser.loadingManifest")} onClose={() => setIsOpen(false)}>
        <div className="p-16 text-center">
          {webT("browser.loadingResource", { resource: createProject.variables || "" })}
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} title={webT("browser.browse")} onClose={() => setIsOpen(false)}>
      <VaultProvider useGlobal={false}>
        {createProject.isError ? (
          <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {webT("browser.openFailed")}
          </div>
        ) : null}
        <LocalizedIIIFBrowser
          className="iiif-browser iiif-browser-accessible border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
          navigation={navigationOptions}
          output={output}
          ui={{ homeLink: process.env.NEXT_PUBLIC_IIIF_BROWSER_COLLECTION }}
        />
      </VaultProvider>
    </Modal>
  );
}
