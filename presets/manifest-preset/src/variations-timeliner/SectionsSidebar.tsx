import {
  ActionButton,
  AddIcon,
  DeleteIcon,
  InfoMessage,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  WarningMessage,
} from "@manifest-editor/components";
import { useVault } from "react-iiif-vault";
import { formatTimeDisplay } from "../av-ranges/temporal-range-utils";
import { CreateFirstSection } from "./CreateFirstSection";
import { useTimelinerData } from "./data";
import { addSection, bubbleRows, largestGap, removeSection, type Bubble } from "./model";
import { useTimelinerStore } from "./store";
import { bubbleColour } from "./themes";

/** Left panel: the sections (IIIF Ranges) configured so far, nested as they are in the manifest. */
export function SectionsSidebar() {
  const vault = useVault();
  const { manifest, canvases, canvas, bubbles, palette } = useTimelinerData();
  const { selected, select, seekTo, setCanvasId } = useTimelinerStore();
  const rows = bubbleRows(bubbles);
  const gap = canvas ? largestGap(bubbles, canvas.duration) : null;
  const single = selected.length === 1 ? bubbles.find((item) => item.id === selected[0]) : undefined;

  function choose(bubble: Bubble, multiple: boolean) {
    if (multiple) {
      select(selected.includes(bubble.id) ? selected.filter((id) => id !== bubble.id) : [...selected, bubble.id]);
      return;
    }
    select([bubble.id]);
    seekTo?.(bubble.start);
  }

  return (
    <Sidebar>
      <SidebarHeader
        title="Variations Timeliner"
        actions={
          canvas
            ? [
                {
                  id: "vt-add-section",
                  icon: <AddIcon className="text-xl" />,
                  title: gap ? "Add section in the largest gap" : "Every part of the timeline is already in a section",
                  disabled: !gap || !bubbles.length,
                  onClick: () => {
                    if (!gap || !manifest) return;
                    const current = vault.get({ id: manifest.id, type: "Manifest" });
                    const id = addSection(vault, current, canvas.id, canvas.duration, gap);
                    if (id) select([id]);
                  },
                },
                {
                  id: "vt-delete-section",
                  icon: <DeleteIcon className="text-xl" />,
                  title: "Delete selected section",
                  disabled: !single,
                  onClick: () => {
                    if (!single) return;
                    removeSection(vault, single);
                    select([]);
                  },
                },
              ]
            : []
        }
      />
      <SidebarContent className="p-2 flex flex-col gap-2">
        {!manifest ? <InfoMessage>Open a manifest to use Variations Timeliner.</InfoMessage> : null}
        {manifest && !canvas ? (
          <WarningMessage>
            Variations Timeliner needs a canvas with audio or video and a duration. Add media using the canvas editor.
          </WarningMessage>
        ) : null}
        {canvas && canvases.length > 1 ? (
          <select
            aria-label="Media canvas"
            className="p-2 bg-me-gray-100 border-b border-b-me-gray-500 text-sm"
            value={canvas.id}
            onChange={(e) => setCanvasId(e.currentTarget.value)}
          >
            {canvases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        ) : null}
        {canvas && !bubbles.length ? <CreateFirstSection canvas={canvas} compact /> : null}
        {rows.length ? (
          <ul className="flex flex-col gap-0.5 list-none m-0 p-0" aria-label="Sections">
            {rows.map(({ bubble, level }) => {
              const isSelected = selected.includes(bubble.id);
              return (
                <li key={bubble.id}>
                  <button
                    type="button"
                    aria-label={`${bubble.title}, ${formatTimeDisplay(bubble.start)} to ${formatTimeDisplay(bubble.end)}`}
                    aria-pressed={isSelected}
                    onClick={(e) => choose(bubble, e.ctrlKey || e.metaKey || e.shiftKey)}
                    style={{ paddingInlineStart: 8 + level * 16 }}
                    className={[
                      "w-full text-start rounded-md border pe-2 py-1.5 flex items-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500",
                      isSelected ? "border-me-primary-400 bg-me-primary-50" : "border-transparent hover:bg-me-gray-100",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className="w-3 h-3 rounded-full border border-black/25 shrink-0"
                      style={{ background: bubbleColour(palette, bubble.height, bubble.colour) }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm truncate ${isSelected ? "font-semibold text-me-primary-900" : ""}`}
                      >
                        {bubble.title}
                      </span>
                      <span className="block text-xs text-me-gray-500 tabular-nums">
                        {formatTimeDisplay(bubble.start)} – {formatTimeDisplay(bubble.end)}
                        {bubble.children.length
                          ? ` · ${bubble.children.length} sub-section${bubble.children.length === 1 ? "" : "s"}`
                          : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {rows.length ? (
          <p className="text-xs text-me-gray-500 px-1">
            Select a section to edit it. Ctrl/Cmd-click to select siblings for grouping.
          </p>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
