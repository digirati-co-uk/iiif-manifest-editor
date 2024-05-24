"use client";

import { useQuery } from "@tanstack/react-query";
import { ManifestEditor } from "manifest-editor";
import "manifest-editor/dist/index.css";

export default function ExampleEditor(props: { manifest: string }) {
  const { isPending, data, error } = useQuery({
    queryKey: ["iiif-manifest-example", { manifest: props.manifest }],
    queryFn: () => fetch(props.manifest).then((res) => res.json()),
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-2 bg-blue-50 flex gap-2">
        <div className="font-semibold">Wunder example</div>
        <div className="">Simple book representation in IIIF</div>
        <div></div>
        <button className="bg-[#AC5574] text-white text-sm px-2 py-1 rounded">Next example</button>
      </div>
      <div className="w-full flex flex-1 max-w-full min-w-0">
        <ManifestEditor resource={{ id: data.id, type: "Manifest" }} data={data as any} />
      </div>
    </div>
  );
}
