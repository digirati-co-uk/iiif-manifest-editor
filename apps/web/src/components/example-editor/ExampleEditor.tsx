"use client";

import { upgrade } from "@iiif/parser/upgrader";
import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";

export default function ExampleEditor({
  example,
  manifest,
  nextId,
}: {
  manifest: string;
  example: { label: string; description: string; url: string; thumbnail?: string };
  nextId?: string;
}) {
  const { isPending, data, error } = useQuery({
    queryKey: ["iiif-manifest-example", { manifest: manifest }],
    queryFn: async () => upgrade(await fetch(manifest).then((res) => res.json())),
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-2 bg-blue-50 flex gap-2">
        <div className="font-semibold">{example.label}</div>
        <div className="">{example.description}</div>
        <div></div>
        {nextId ? (
          <a href={`/examples/${nextId}`} className="bg-[#AC5574] text-white text-sm px-2 py-1 rounded">
            Next example
          </a>
        ) : null}
      </div>
      <div className="w-full flex flex-1 max-w-full min-w-0">
        <ManifestEditor resource={{ id: data.id, type: "Manifest" }} data={data as any} />
      </div>
    </div>
  );
}
