import {
  ActionButton,
  AddIcon,
  AudioIcon,
  CloseIcon,
  Form,
  InfoMessage,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  WarningMessage,
} from "@manifest-editor/components";
import { type LayoutPanel, useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useMemo, useRef, useState } from "react";
import { useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { deleteTemporalRange, updateTemporalRange } from "./av-range-mutations";
import { useAvRangeStore } from "./av-range-store";
import { getAvCanvases } from "./av-media-utils";
import { AV_TEMPORAL_RANGE_CREATOR_ID } from "./av-temporal-range-creator";
import {
  clampIntervalToNeighbors,
  formatTime,
  formatTimeDisplay,
  getSegmentsForCanvas,
  getTemporalGaps,
  getTemporalSegmentsFromStructures,
  parseTimeInput,
  validateTemporalSegments,
  type TemporalRangeSegment,
} from "./temporal-range-utils";

export const avRangesPanel: LayoutPanel = {
  id: "@manifest-editor/av-ranges-listing",
  label: "A/V Ranges",
  icon: <AudioIcon />,
  options: { minWidth: 300, maxWidth: 360 },
  render: () => <AvRangesPanel />,
};

function AvRangesPanel() {
  const vault = useVault();
  const manifest = useManifest();
  const { create } = useLayoutActions();
  const {
    canvasId,
    selectedRangeId,
    draft,
    setCanvasId,
    setSelectedRangeId,
    setDraft,
  } = useAvRangeStore();
  const [query, setQuery] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const { canvases, segments } = useVaultSelector(
    (_, vault) => ({
      canvases: getAvCanvases(vault, manifest),
      segments: getTemporalSegmentsFromStructures(vault, manifest),
    }),
    [manifest],
  );

  const activeCanvas = useMemo(() => {
    if (!canvases.length) return null;
    return canvases.find((canvas) => canvas.id === canvasId) || canvases[0]!;
  }, [canvases, canvasId]);

  useEffect(() => {
    if (!canvasId && activeCanvas) {
      setCanvasId(activeCanvas.id);
    }
  }, [activeCanvas?.id, canvasId, setCanvasId]);

  const canvasSegments = useMemo(
    () => (activeCanvas ? getSegmentsForCanvas(segments, activeCanvas.id) : []),
    [segments, activeCanvas?.id],
  );
  const selectedSegment =
    canvasSegments.find((segment) => segment.id === selectedRangeId) || null;
  const filteredSegments = canvasSegments.filter((segment) =>
    segment.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  // Scroll editor into view when a range is selected
  useEffect(() => {
    if (selectedSegment && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedSegment?.id]);

  const createFromInterval = (
    interval: { start: number; end: number },
    title = "Untitled range",
  ) => {
    if (!manifest || !activeCanvas) return;
    const clamped = clampIntervalToNeighbors(
      interval,
      canvasSegments,
      activeCanvas.duration,
    );
    if (clamped.end <= clamped.start) return;
    create({
      type: "Range",
      parent: { id: manifest.id, type: "Manifest" },
      property: "structures",
      initialCreator: AV_TEMPORAL_RANGE_CREATOR_ID,
      initialData: {
        canvas: activeCanvas,
        canvasId: activeCanvas.id,
        segments: canvasSegments,
        title,
        start: clamped.start,
        end: clamped.end,
      },
    });
    setDraft(null);
  };

  const gaps = activeCanvas
    ? getTemporalGaps(canvasSegments, activeCanvas.duration)
    : [];

  const openNewRangeDraft = () => {
    if (!activeCanvas) return;
    const firstGap = gaps.find((gap) => gap.duration > 0.25) || {
      start: 0,
      end: Math.min(30, activeCanvas.duration),
    };
    setDraft({ start: firstGap.start, end: firstGap.end });
  };

  return (
    <Sidebar>
      <SidebarHeader
        title="A/V Ranges"
        actions={
          activeCanvas
            ? [
                {
                  icon: <AddIcon color="currentColor" height={16} />,
                  title: "New range",
                  onClick: openNewRangeDraft,
                },
              ]
            : []
        }
      />
      <SidebarContent className="p-3 flex flex-col gap-3">
        {!canvases.length ? (
          <WarningMessage>
            No audio or video canvases are available for temporal range editing.
          </WarningMessage>
        ) : null}

        {activeCanvas ? (
          <>
            {canvases.length > 1 ? (
              <Form.InputContainer>
                <Form.Label htmlFor="av-canvas-select">Canvas</Form.Label>
                <select
                  id="av-canvas-select"
                  className="p-2 bg-me-gray-100 border-b border-b-me-gray-500 text-sm"
                  value={activeCanvas.id}
                  onChange={(e) => setCanvasId(e.currentTarget.value)}
                >
                  {canvases.map((canvas) => (
                    <option key={canvas.id} value={canvas.id}>
                      {canvas.title}
                    </option>
                  ))}
                </select>
              </Form.InputContainer>
            ) : null}

            {draft ? (
              <div className="rounded-lg border border-me-primary-300 bg-me-primary-50 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-me-primary-900">Draft range</div>
                  <button
                    type="button"
                    className="text-me-gray-500 hover:text-me-gray-700 p-0.5 rounded hover:bg-white/50"
                    aria-label="Discard draft"
                    onClick={() => setDraft(null)}
                  >
                    <CloseIcon width={14} height={14} />
                  </button>
                </div>
                <div className="text-sm tabular-nums text-me-primary-700">
                  {formatTimeDisplay(draft.start)} → {formatTimeDisplay(draft.end)}
                  <span className="text-me-primary-500 ml-2">
                    ({formatTimeDisplay(draft.end - draft.start)})
                  </span>
                </div>
                <ActionButton
                  primary
                  center
                  onPress={() => createFromInterval(draft)}
                >
                  Create range from selection
                </ActionButton>
              </div>
            ) : null}

            {selectedSegment ? (
              <div ref={editorRef}>
                <SelectedRangeEditor
                  key={selectedSegment.id}
                  segment={selectedSegment}
                  canvasDuration={activeCanvas.duration}
                  segments={canvasSegments}
                />
              </div>
            ) : null}

            {!selectedSegment && !draft && canvasSegments.length === 0 ? (
              <InfoMessage>
                Create the first range by dragging on the timeline, using Mark in/out, or pressing New range.
              </InfoMessage>
            ) : null}

            {canvasSegments.length > 0 ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <Form.InputContainer className="flex-1 min-w-0">
                    <Form.Input
                      id="av-range-search"
                      value={query}
                      placeholder="Search ranges…"
                      onChange={(e: any) => setQuery(e.currentTarget.value)}
                      aria-label="Search ranges"
                    />
                  </Form.InputContainer>
                  <span className="text-xs text-me-gray-500 tabular-nums flex-shrink-0">
                    {filteredSegments.length}/{canvasSegments.length}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {filteredSegments.map((segment, index) => (
                    <button
                      key={segment.id}
                      type="button"
                      className={[
                        "text-left rounded-md border px-3 py-2 transition-colors",
                        selectedRangeId === segment.id
                          ? "border-me-primary-400 bg-me-primary-50"
                          : "border-me-gray-200 bg-white hover:bg-me-gray-50",
                      ].join(" ")}
                      onClick={() => setSelectedRangeId(segment.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-me-gray-400 w-4 text-right shrink-0 mt-0.5 leading-tight">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={[
                              "text-sm font-medium truncate leading-tight",
                              selectedRangeId === segment.id
                                ? "text-me-primary-900"
                                : "text-me-gray-900",
                            ].join(" ")}
                          >
                            {segment.title}
                          </div>
                          <div className="text-xs text-me-gray-500 tabular-nums mt-0.5">
                            {formatTimeDisplay(segment.start)} – {formatTimeDisplay(segment.end)}{" "}
                            <span className="text-me-gray-400">· {formatTimeDisplay(segment.duration)}</span>
                          </div>
                        </div>
                        {selectedRangeId === segment.id ? (
                          <span className="w-1 h-4 rounded-full bg-me-primary-500 shrink-0 mt-0.5" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}

function SelectedRangeEditor({
  segment,
  canvasDuration,
  segments,
}: {
  segment: TemporalRangeSegment;
  canvasDuration: number;
  segments: TemporalRangeSegment[];
}) {
  const vault = useVault();
  const { setSelectedRangeId } = useAvRangeStore();
  const [title, setTitle] = useState(segment.title);
  const [start, setStart] = useState(formatTime(segment.start));
  const [end, setEnd] = useState(formatTime(segment.end));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [noNav, setNoNav] = useState(
    segment.behavior?.includes("no-nav") || false,
  );
  const parsedStart = parseTimeInput(start);
  const parsedEnd = parseTimeInput(end);
  const validation =
    parsedStart === null || parsedEnd === null
      ? {
          valid: false,
          issues: [{ message: "Enter readable start and end times." }],
        }
      : validateTemporalSegments(
          [
            ...segments.filter((item) => item.id !== segment.id),
            { id: segment.id, title, start: parsedStart, end: parsedEnd },
          ],
          canvasDuration,
          { requireTitle: true },
        );

  const selectedIndex = segments.findIndex((item) => item.id === segment.id);
  const previous = selectedIndex > 0 ? segments[selectedIndex - 1] : null;
  const next = selectedIndex >= 0 ? segments[selectedIndex + 1] : null;

  const save = () => {
    if (parsedStart === null || parsedEnd === null || !validation.valid) return;
    const clamped = clampIntervalToNeighbors(
      { start: parsedStart, end: parsedEnd },
      segments,
      canvasDuration,
      segment.id,
    );
    updateTemporalRange(vault as any, segment, {
      label: { en: [title.trim()] },
      start: clamped.start,
      end: clamped.end,
      behavior: noNav ? ["no-nav"] : [],
    });
  };

  return (
    <div className="rounded-lg border border-me-gray-200 bg-white overflow-hidden">
      {/* Editor header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-me-gray-50 border-b border-me-gray-200">
        <div className="text-xs font-semibold text-me-gray-600 uppercase tracking-wide flex-1">
          Edit range
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-me-gray-500 hover:text-me-gray-700 px-1.5 py-0.5 rounded hover:bg-me-gray-200 transition-colors"
          onClick={() => setSelectedRangeId(null)}
        >
          <CloseIcon width={12} height={12} />
          Deselect
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <Form.InputContainer>
          <Form.Label htmlFor="av-range-title">Title</Form.Label>
          <Form.Input
            id="av-range-title"
            value={title}
            onChange={(e: any) => setTitle(e.currentTarget.value)}
          />
        </Form.InputContainer>
        <div className="grid grid-cols-2 gap-2">
          <Form.InputContainer>
            <Form.Label htmlFor="av-range-start">Start</Form.Label>
            <Form.Input
              id="av-range-start"
              value={start}
              onChange={(e: any) => setStart(e.currentTarget.value)}
            />
          </Form.InputContainer>
          <Form.InputContainer>
            <Form.Label htmlFor="av-range-end">End</Form.Label>
            <Form.Input
              id="av-range-end"
              value={end}
              onChange={(e: any) => setEnd(e.currentTarget.value)}
            />
          </Form.InputContainer>
        </div>
        <div className="text-xs text-me-gray-500 tabular-nums">
          Duration:{" "}
          <span className="font-medium text-me-gray-700">
            {parsedStart !== null && parsedEnd !== null
              ? formatTimeDisplay(Math.max(0, parsedEnd - parsedStart))
              : "—"}
          </span>
        </div>
        {!validation.valid ? (
          <WarningMessage>
            {validation.issues[0]?.message || "Range is invalid."}
          </WarningMessage>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <ActionButton primary isDisabled={!validation.valid} onPress={save}>
            Save
          </ActionButton>
          <ActionButton
            className="text-red-700 hover:bg-red-50"
            onPress={() => {
              deleteTemporalRange(vault as any, segment);
              setSelectedRangeId(null);
            }}
          >
            Delete
          </ActionButton>
        </div>

        {previous || next ? (
          <div className="flex flex-wrap gap-2 border-t border-me-gray-100 pt-2.5">
            {previous ? (
              <ActionButton
                onPress={() => {
                  updateTemporalRange(vault as any, previous, { end: segment.end });
                  deleteTemporalRange(vault as any, segment);
                  setSelectedRangeId(previous.id);
                }}
              >
                ← Merge with previous
              </ActionButton>
            ) : null}
            {next ? (
              <ActionButton
                onPress={() => {
                  updateTemporalRange(vault as any, segment, { end: next.end });
                  deleteTemporalRange(vault as any, next);
                  setSelectedRangeId(segment.id);
                }}
              >
                Merge with next →
              </ActionButton>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="flex items-center gap-1.5 text-left text-xs font-medium text-me-gray-500 hover:text-me-gray-700 py-0.5 transition-colors"
          onClick={() => setAdvancedOpen((isOpen) => !isOpen)}
        >
          <ChevronIcon open={advancedOpen} />
          Advanced options
        </button>
        {advancedOpen ? (
          <label className="flex items-center gap-2 text-sm text-me-gray-700 pl-5">
            <input
              type="checkbox"
              checked={noNav}
              onChange={(e) => setNoNav(e.currentTarget.checked)}
            />
            Hidden from navigation
          </label>
        ) : null}
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
      fill="currentColor"
    >
      <path d="M5.5 3.5 10 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
