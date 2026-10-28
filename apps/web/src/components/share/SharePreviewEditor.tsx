import { useTranslations } from "@manifest-editor/i18n";
import { upgrade } from "@iiif/parser/upgrader";
import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";
import { webUiResources } from "../../i18n/resources";
import { useMemo } from "react";

export function SharePreviewEditor({ manifest }: { manifest: string }) {
  const webT = useTranslations("web");

  const { isPending, data, error } = useQuery({
    queryKey: ["preview-editor", { manifest: manifest }],
    queryFn: async () => upgrade(await fetch(manifest).then((res) => res.json())),
    staleTime: Number.POSITIVE_INFINITY,
    retryOnMount: false,
    retry: false,
  });

  const resource = useMemo(() => (data ? { id: data?.id, type: data?.type } : null), [data]);

  if (isPending) return <div>{webT("feedback.loading")}</div>;
  if (error || !resource) return <p role="alert">{webT("feedback.projectFailed")}</p>;

  return <ManifestEditor localisation={webUiResources} resource={resource} data={data as any} />;
}
