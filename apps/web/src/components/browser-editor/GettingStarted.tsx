"use client";
import { useMutation } from "@tanstack/react-query";
import { createBlankManifest } from "./browser-state";
import { useRouter } from "next/navigation";

export default function GettingStarted() {
  const router = useRouter();
  const blankManifest = useMutation({
    mutationFn: createBlankManifest,
    onSuccess: (data) => {
      if (data) {
        router.push(`/editor/${data.id}`);
      }
    },
  });

  return (
    <div className="bg-me-gray-100 py-8 px-6 border-b">
      <h2 className="text-2xl mb-6">Get started</h2>
      <div className="flex gap-3">
        <div className="w-28 flex items-center flex-col group cursor-default" onClick={() => blankManifest.mutate()}>
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
              +
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">New manifest</div>
        </div>
        {/* <div className="w-28 flex items-center flex-col group cursor-default">
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
              A
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Paste link</div>
        </div>
        <div className="w-28 flex items-center flex-col group cursor-default">
          <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
              A
            </div>
          </div>
          <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Open file</div>
        </div>*/}
      </div>
    </div>
  );
}
