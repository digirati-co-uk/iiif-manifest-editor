import { upgrade } from "@iiif/parser/upgrader";
import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";

export function SharePreviewEditor({ manifest }: { manifest: string }) {
  const { isPending, data, error } = useQuery({
    queryKey: ["preview-editor", { manifest: manifest }],
    queryFn: async () => upgrade(await fetch(manifest).then((res) => res.json())),
    staleTime: Infinity,
    retryOnMount: false,
    retry: false,
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return "An error has occurred: " + error.message;

  return <ManifestEditor resource={{ id: data.id, type: "Manifest" }} data={data as any} />;
}
