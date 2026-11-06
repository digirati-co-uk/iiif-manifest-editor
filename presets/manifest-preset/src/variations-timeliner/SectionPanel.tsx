import { ActionButton, InfoMessage } from "@manifest-editor/components";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { useGenericEditor, useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";
import { useVault } from "react-iiif-vault";
import { formatTime, parseTimeInput } from "../av-ranges/temporal-range-utils";
import { useTimelinerData } from "./data";
import {
  canSplit,
  isSimpleLeaf,
  removeSection,
  setSectionColour,
  setSectionTimes,
  splitSection,
  validateSectionTimes,
  type Bubble,
} from "./model";
import { useTimelinerStore } from "./store";
import { TimeText } from "./TimeText";
import { bubbleColour, toHexColour } from "./themes";
import type { AvCanvas } from "../av-ranges/av-media-utils";
import type { ColourPalette } from "./themes";

/** Right panel for a section; opened when a section is chosen in the sidebar or on the timeline. */
export function SectionPanel({ id }: { id?: string }) {
  const { canvas, bubbles, palette } = useTimelinerData();
  const bubble = bubbles.find((item) => item.id === id);
  if (!canvas || !bubble) {
    return (
      <div className="p-4">
        <InfoMessage>This section is no longer available. Choose another section from the sidebar.</InfoMessage>
      </div>
    );
  }
  return <SectionForm key={bubble.id} bubble={bubble} canvas={canvas} palette={palette} />;
}

function TimeField({
  label,
  value,
  onCommit,
  onPlayhead,
}: {
  label: string;
  value: number;
  onCommit: (value: number | null) => void;
  onPlayhead: () => void;
}) {
  const [text, setText] = useState(formatTime(value));
  useEffect(() => setText(formatTime(value)), [value]);
  const commit = () => onCommit(parseTimeInput(text));
  return (
    <InputContainer $wide>
      <InputLabel>{label}</InputLabel>
      <div className="flex gap-2 items-center">
        <Input
          aria-label={label}
          value={text}
          inputMode="decimal"
          onChange={(e: any) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <ActionButton onPress={onPlayhead}>Set to playhead</ActionButton>
      </div>
    </InputContainer>
  );
}

function SectionForm({ bubble, canvas, palette }: { bubble: Bubble; canvas: AvCanvas; palette: ColourPalette }) {
  const vault = useVault();
  const { edit } = useLayoutActions();
  const { time, seekTo, select } = useTimelinerStore();
  const ref = useMemo(() => ({ id: bubble.id, type: "Range" as const }), [bubble.id]);
  const editor = useGenericEditor(ref);
  const [error, setError] = useState("");
  const simple = isSimpleLeaf(vault, bubble.id);
  const automatic = bubbleColour(palette, bubble.height);
  const fill = bubbleColour(palette, bubble.height, bubble.colour);
  const { label, summary } = editor.descriptive;

  function commitTimes(start: number | null, end: number | null) {
    const error =
      start === null || end === null
        ? "Enter times as seconds or mm:ss."
        : validateSectionTimes(start, end, canvas.duration);
    setError(error || "");
    if (!error) setSectionTimes(vault, bubble.id, canvas.id, start!, end!, canvas.duration);
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full pb-32">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="w-5 h-5 rounded-full border border-black/25 shrink-0"
          style={{ background: fill }}
        />
        <div className="min-w-0">
          <div className="font-semibold truncate">{bubble.title}</div>
          <div className="text-xs text-me-gray-500 tabular-nums">
            <TimeText value={bubble.start} /> – <TimeText value={bubble.end} />
          </div>
        </div>
        <ActionButton className="ms-auto" onPress={() => seekTo?.(bubble.start)}>
          Go to start
        </ActionButton>
      </div>

      <LanguageFieldEditor
        containerId={label.containerId()}
        focusId={label.focusId()}
        label="Section title"
        fields={label.get()}
        onSave={(e: any) => label.set(e.toInternationalString())}
      />
      <LanguageFieldEditor
        containerId={summary.containerId()}
        focusId={summary.focusId()}
        label="Description"
        disallowHTML={false}
        fields={summary.get()}
        onSave={(e: any) => summary.set(e.toInternationalString())}
      />

      {simple ? (
        <div className="flex flex-col gap-3">
          <TimeField
            label="Start"
            value={bubble.start}
            onCommit={(value) => commitTimes(value, bubble.end)}
            onPlayhead={() => commitTimes(time, bubble.end)}
          />
          <TimeField
            label="End"
            value={bubble.end}
            onCommit={(value) => commitTimes(bubble.start, value)}
            onPlayhead={() => commitTimes(bubble.start, time)}
          />
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <InfoMessage small>
          {bubble.children.length
            ? "This section spans its sub-sections"
            : "This section has several targets"}
        </InfoMessage>
      )}

      <InputContainer $wide>
        <InputLabel>Colour</InputLabel>
        <div className="flex flex-wrap items-center gap-2 p-2">
          <button
            type="button"
            aria-label="Automatic colour"
            aria-pressed={!bubble.colour}
            onClick={() => setSectionColour(vault, bubble.id, null)}
            style={{ background: automatic }}
            className={`h-7 px-2 rounded-full border border-black/25 text-xs ${
              !bubble.colour ? "ring-2 ring-me-primary-500 ring-offset-1" : ""
            }`}
          >
            Auto
          </button>
          {palette.colours.map((colour) => (
            <button
              key={colour}
              type="button"
              aria-label={`Colour ${colour}`}
              aria-pressed={bubble.colour === colour}
              onClick={() => setSectionColour(vault, bubble.id, colour)}
              style={{ background: colour }}
              className={`w-7 h-7 rounded-full border border-black/25 ${
                bubble.colour === colour ? "ring-2 ring-me-primary-500 ring-offset-1" : ""
              }`}
            />
          ))}
          <input
            type="color"
            aria-label="Custom colour"
            value={toHexColour(bubble.colour || automatic)}
            onChange={(e) => setSectionColour(vault, bubble.id, e.target.value)}
            className="w-8 h-7 p-0 border-0 bg-transparent"
          />
        </div>
      </InputContainer>

      {bubble.children.length ? (
        <InputContainer $wide>
          <InputLabel>Sub-sections</InputLabel>
          <ul className="list-none m-0 p-0 flex flex-col gap-1">
            {bubble.children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  className="w-full text-start text-sm px-2 py-1 rounded hover:bg-me-gray-100"
                  onClick={() => {
                    select([child.id]);
                    seekTo?.(child.start);
                  }}
                >
                  {child.title}{" "}
                  <span className="text-xs text-me-gray-500 tabular-nums">
                    <TimeText value={child.start} /> – <TimeText value={child.end} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </InputContainer>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ActionButton
          isDisabled={!canSplit(vault, bubble, time)}
          onPress={() => {
            const id = splitSection(vault, bubble, canvas.id, time);
            if (id) select([id]);
          }}
        >
          Split at playhead
        </ActionButton>
        <ActionButton onPress={() => edit({ id: bubble.id, type: "Range" }, {}, { forceOpen: true })}>
          Open in editor
        </ActionButton>
        <ActionButton
          onPress={() => {
            removeSection(vault, bubble);
            select([]);
          }}
        >
          Delete section
        </ActionButton>
      </div>
    </div>
  );
}
