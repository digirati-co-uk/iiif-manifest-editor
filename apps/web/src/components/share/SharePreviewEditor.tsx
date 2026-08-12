import { upgradeToPresentation4 } from "@iiif/parser/presentation-4/upgrader";
import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";
import { useMemo } from "react";

export function SharePreviewEditor({ manifest }: { manifest: string }) {
  const { isPending, data, error } = useQuery({
    queryKey: ["preview-editor", { manifest: manifest }],
    queryFn: async () => upgradeToPresentation4(await fetch(manifest).then((res) => res.json())),
    staleTime: Number.POSITIVE_INFINITY,
    retryOnMount: false,
    retry: false,
  });

  const resource = useMemo(() => (data ? { id: data?.id, type: data?.type } : null), [data]);

  if (isPending || !resource) return <div>Loading...</div>;
  if (error) return "An error has occurred: " + error.message;

  return <ManifestEditor resource={resource} data={data as any} />;
}
