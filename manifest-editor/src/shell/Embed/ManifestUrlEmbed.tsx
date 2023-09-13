import { AppDefinition } from "@/apps/app-loader";
import { useVaultFromManifestJson } from "@/hooks/useVaultFromManifestJson";
import { useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useMemoOnce } from "@/hooks/useMemoOnce";
import { Vault } from "@iiif/vault";
import { SingleVaultLoader } from "@/shell/ProjectContext/storage/SingleVaultLoader";
import { StaticStorageBackend } from "@/shell/ProjectContext/backend/StaticBackend";
import { ManifestEditor } from "@/ManifestEditor";

export function ManifestUrlEmbed({ query, apps }: { apps: AppDefinition; query: any }) {
  const [vault, invalidate] = useMemoOnce(() => new Vault());
  const [isLoading, setIsLoading] = useState(true);
  const [reference, setReference] = useState<{ id: string; type: string } | undefined>(undefined);
  const [projectRef, resetProject] = useMemoOnce(() => {
    if (!vault.current || isLoading || !reference) {
      return null;
    }

    return {
      backend: StaticStorageBackend.create(reference, {
        data: { urn: query.manifest },
      }),
      storage: new SingleVaultLoader(vault.current),
      defaultApp: "manifest-editor",
    };
  });

  useEffect(() => {
    vault.current.loadManifest(query.manifest).then((ref) => {
      setReference(ref);
      setIsLoading(false);
      resetProject();
    });
  }, [query.manifest]);

  useEffect(() => {
    const unloadCallback = () => {
      if (window.opener) {
        window.opener.postMessage({ type: "close" }, "*");
      }
      console.log("working?");
    };

    window.addEventListener("beforeunload", unloadCallback);

    return () => {
      window.removeEventListener("beforeunload", unloadCallback);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!projectRef.current) {
    return <div>Unknown error</div>;
  }

  const project = projectRef.current;

  const miniEditor = query.mini
    ? {
        resource: query.canvas ? { id: query.canvas, type: "Canvas" } : (reference as any),
      }
    : undefined;

  return (
    <ManifestEditor
      apps={apps as any}
      initialApp={{ id: "manifest-editor" }}
      // initialApp={initialApp}
      hideHeader={true}
      saveCurrentApp={false}
      project={project}
      layout={{
        miniEditor,
      }}
    />
  );
}
