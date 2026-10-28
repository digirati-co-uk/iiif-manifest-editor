"use client";
import { HeaderLanguageSwitcher } from "../site/HeaderLanguageSwitcher";

import { useTranslations } from "@manifest-editor/i18n";

import { upgrade } from "@iiif/parser/upgrader";
import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";
import { webUiResources } from "../../i18n/resources";

export default function ExampleEditor({
  example,
  manifest,
  nextId,
}: {
  manifest: string;
  example: { label: string; description: string; url: string; thumbnail?: string };
  nextId?: string;
}) {
  const webT = useTranslations("web");

  const { isPending, data, error } = useQuery({
    queryKey: ["iiif-manifest-example", { manifest: manifest }],
    queryFn: async () => upgrade(await fetch(manifest).then((res) => res.json())),
  });

  if (isPending) return <div>{webT("feedback.loading")}</div>;
  if (error || !data) return <div role="alert">{webT("feedback.projectFailed")}</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-2 bg-blue-50 flex flex-wrap items-center gap-2">
        <HeaderLanguageSwitcher />
        <div className="font-semibold">{example.label}</div>
        <div className="">{example.description}</div>
        <div></div>
        {nextId ? (
          <a href={`/examples/${nextId}`} className="bg-[#AC5574] text-white text-sm px-2 py-1 rounded">
            {webT("examples.next")}
          </a>
        ) : null}
      </div>
      <div className="w-full flex flex-1 max-w-full min-w-0">
        <ManifestEditor localisation={webUiResources} resource={{ id: data.id, type: "Manifest" }} data={data as any} />
      </div>
    </div>
  );
}
