import { ActionButton, AddIcon } from "@manifest-editor/components";
import { useState } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import type { AvCanvas } from "../av-ranges/av-media-utils";
import { formatTime } from "../av-ranges/temporal-range-utils";
import { addSection } from "./model";
import { useTimelinerStore } from "./store";

/**
 * Shown until the manifest has a section for the canvas. Mirrors the "create range"
 * prompt of the range editor: one action creates the first bubble, spanning the whole
 * recording, which is then selected so it can be split and refined.
 */
export function CreateFirstSection({ canvas, compact }: { canvas: AvCanvas; compact?: boolean }) {
  const vault = useVault();
  const manifest = useManifest()!;
  const select = useTimelinerStore((s) => s.select);
  const [title, setTitle] = useState("Section 1");

  function create() {
    const current = vault.get({ id: manifest.id, type: "Manifest" });
    const id = addSection(vault, current, canvas.id, canvas.duration, { label: title });
    if (id) select([id]);
  }

  return (
    <form
      className={`flex flex-col items-center justify-center text-center gap-3 ${compact ? "p-4" : "p-10"}`}
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
      {compact ? null : <h2 className="text-lg font-semibold">Create your first section</h2>}
      <p className="opacity-70 max-w-md text-sm">
        A section is a IIIF Range covering part of “{canvas.title}” ({formatTime(canvas.duration).replace(/\.000$/, "")}
        ). Start with one bubble spanning the whole recording, then split it at the playhead to add structure.
      </p>
      <label className="flex flex-col gap-1 text-sm items-stretch w-full max-w-xs text-left">
        Section name
        <input
          className="border border-me-gray-300 rounded px-2 py-1 bg-white"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <ActionButton large primary onPress={create}>
        <AddIcon className="text-xl" /> Create first section
      </ActionButton>
    </form>
  );
}
