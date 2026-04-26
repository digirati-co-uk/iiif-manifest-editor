import {
  ActionButton,
  InfoMessage,
  WarningMessage,
} from "@manifest-editor/components";
import { type LayoutPanel, useLayoutActions } from "@manifest-editor/shell";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import {
  createTemporalRange,
  deleteTemporalRange,
  updateTemporalRange,
} from "./av-range-mutations";
import { useAvRangeStore } from "./av-range-store";
import { getAvCanvases, type AvCanvas } from "./av-media-utils";
import { AV_TEMPORAL_RANGE_CREATOR_ID } from "./av-temporal-range-creator";
import {
  clampIntervalToNeighbors,
  formatTime,
  formatTimeDisplay,
  getSegmentsForCanvas,
  getTemporalGaps,
  getTemporalSegmentsFromStructures,
  type TemporalRangeSegment,
} from "./temporal-range-utils";

export const avRangesWorkbench: LayoutPanel = {
  id: "av-ranges-workbench",
  label: "A/V Range Workbench",
  icon: "",
  render: () => <AvRangesWorkbench />,
};

const SNAP_SECONDS = 0.75;

function snapTime(
  time: number,
  segments: Array<Pick<TemporalRangeSegment, "start" | "end">>,
  duration: number,
) {
  const points = [
    0,
    duration,
    ...segments.flatMap((segment) => [segment.start, segment.end]),
  ];
  const nearest = points.reduce(
    (best, point) =>
      Math.abs(point - time) < Math.abs(best - time) ? point : best,
    points[0] || 0,
  );
  return Math.abs(nearest - time) <= SNAP_SECONDS ? nearest : time;
}

function snapInterval(
  interval: { start: number; end: number },
  segments: TemporalRangeSegment[],
  duration: number,
) {
  return {
    start: snapTime(interval.start, segments, duration),
    end: snapTime(interval.end, segments, duration),
  };
}

function snapMovedStart(
  start: number,
  movingSegment: TemporalRangeSegment,
  segments: TemporalRangeSegment[],
  duration: number,
) {
  const segmentDuration = movingSegment.end - movingSegment.start;
  const points = [
    0,
    Math.max(0, duration - segmentDuration),
    ...segments
      .filter((segment) => segment.id !== movingSegment.id)
      .flatMap((segment) => [segment.end, segment.start - segmentDuration]),
  ].filter((point) => point >= 0 && point <= duration - segmentDuration);
  const nearest = points.reduce(
    (best, point) =>
      Math.abs(point - start) < Math.abs(best - start) ? point : best,
    points[0] || 0,
  );
  return Math.abs(nearest - start) <= SNAP_SECONDS ? nearest : start;
}

function AvRangesWorkbench() {
  const vault = useVault();
  const manifest = useManifest();
  const { create } = useLayoutActions();
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const dragRef = useRef<{ start: number; end: number } | null>(null);
  const {
    canvasId,
    selectedRangeId,
    draft,
    markStart,
    setCanvasId,
    setSelectedRangeId,
    setDraft,
    setMarkStart,
  } = useAvRangeStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [loopSelection, setLoopSelection] = useState(false);
  const [timelineScale, setTimelineScale] = useState(1);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

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
  const gaps = activeCanvas
    ? getTemporalGaps(canvasSegments, activeCanvas.duration)
    : [];

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !selectedSegment) return;
    media.currentTime = selectedSegment.start;
    setCurrentTime(selectedSegment.start);
  }, [selectedSegment?.id]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.volume = volume;
  }, [volume]);

  const seek = useCallback(
    (time: number) => {
      const media = mediaRef.current;
      const next = Math.max(0, Math.min(time, activeCanvas?.duration || 0));
      if (media) {
        media.currentTime = next;
      }
      setCurrentTime(next);
    },
    [activeCanvas?.duration],
  );

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      media.play();
    } else {
      media.pause();
    }
  }, []);

  const playSelection = useCallback(() => {
    if (!selectedSegment) return;
    seek(selectedSegment.start);
    mediaRef.current?.play();
  }, [selectedSegment, seek]);

  const createFromDraft = useCallback(() => {
    if (!manifest || !activeCanvas || !draft) return;
    const interval = clampIntervalToNeighbors(
      draft,
      canvasSegments,
      activeCanvas.duration,
    );
    if (interval.end <= interval.start) return;
    create({
      type: "Range",
      parent: { id: manifest.id, type: "Manifest" },
      property: "structures",
      initialCreator: AV_TEMPORAL_RANGE_CREATOR_ID,
      initialData: {
        canvas: activeCanvas,
        canvasId: activeCanvas.id,
        segments: canvasSegments,
        title: "Untitled range",
        start: interval.start,
        end: interval.end,
      },
    });
    setDraft(null);
  }, [manifest, activeCanvas, draft, canvasSegments, create, setDraft]);

  const splitAtPlayhead = useCallback(() => {
    if (!manifest || !activeCanvas || !selectedSegment) return;
    const split = currentTime;
    if (split <= selectedSegment.start || split >= selectedSegment.end) return;

    updateTemporalRange(vault as any, selectedSegment, { end: split });
    const ref = createTemporalRange(vault as any, manifest, {
      canvasId: activeCanvas.id,
      start: split,
      end: selectedSegment.end,
      label: { en: [`${selectedSegment.title} 2`] },
      atIndex:
        selectedSegment.parentKey === "structures"
          ? selectedSegment.parentIndex + 1
          : undefined,
    });
    setSelectedRangeId(ref.id);
  }, [
    manifest,
    activeCanvas,
    selectedSegment,
    currentTime,
    vault,
    setSelectedRangeId,
  ]);

  const deleteSelected = useCallback(() => {
    if (!selectedSegment) return;
    deleteTemporalRange(vault as any, selectedSegment);
    setSelectedRangeId(null);
  }, [selectedSegment, vault, setSelectedRangeId]);

  const resizeRange = useCallback(
    (rangeId: string, interval: { start: number; end: number }) => {
      if (!activeCanvas) return null;
      const segment = canvasSegments.find((item) => item.id === rangeId);
      if (!segment) return null;
      const clamped = clampIntervalToNeighbors(
        interval,
        canvasSegments,
        activeCanvas.duration,
        segment.id,
      );
      if (clamped.end <= clamped.start) return null;
      updateTemporalRange(vault as any, segment, clamped);
      return clamped;
    },
    [activeCanvas, canvasSegments, vault],
  );

  const moveRange = useCallback(
    (rangeId: string, start: number) => {
      if (!activeCanvas) return;
      const sorted = canvasSegments.slice().sort((a, b) => a.start - b.start);
      const segmentIndex = sorted.findIndex((item) => item.id === rangeId);
      const segment = sorted[segmentIndex];
      if (!segment) return;
      const segmentDuration = segment.end - segment.start;
      const previous = segmentIndex > 0 ? sorted[segmentIndex - 1] : null;
      const next =
        segmentIndex >= 0 && segmentIndex < sorted.length - 1
          ? sorted[segmentIndex + 1]
          : null;
      const minStart = previous ? previous.end : 0;
      const maxStart =
        (next ? next.start : activeCanvas.duration) - segmentDuration;
      const nextStart = Math.max(minStart, Math.min(start, maxStart));

      updateTemporalRange(vault as any, segment, {
        start: nextStart,
        end: nextStart + segmentDuration,
      });
    },
    [activeCanvas, canvasSegments, vault],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (!activeCanvas) return;

      if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "j") {
        seek(currentTime - 5);
      } else if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "l"
      ) {
        seek(currentTime + 5);
      } else if (event.key.toLowerCase() === "i") {
        setMarkStart(currentTime);
      } else if (event.key.toLowerCase() === "o" && markStart !== null) {
        setDraft(
          snapInterval(
            {
              start: Math.min(markStart, currentTime),
              end: Math.max(markStart, currentTime),
            },
            canvasSegments,
            activeCanvas.duration,
          ),
        );
        setMarkStart(null);
      } else if (event.key === "Enter" && draft) {
        createFromDraft();
      } else if (event.key === "Escape") {
        setDraft(null);
        setMarkStart(null);
      } else if (event.key.toLowerCase() === "s") {
        splitAtPlayhead();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelected();
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const index = canvasSegments.findIndex(
          (segment) => segment.id === selectedRangeId,
        );
        const nextIndex =
          event.key === "ArrowUp"
            ? Math.max(0, index - 1)
            : Math.min(canvasSegments.length - 1, index + 1);
        const next = canvasSegments[index === -1 ? 0 : nextIndex];
        if (next) setSelectedRangeId(next.id);
      } else if ((event.key === "[" || event.key === "]") && selectedSegment) {
        const delta = event.shiftKey ? 1 : 0.1;
        const next =
          event.key === "["
            ? {
                start: selectedSegment.start + (event.altKey ? delta : -delta),
                end: selectedSegment.end,
              }
            : {
                start: selectedSegment.start,
                end: selectedSegment.end + (event.altKey ? -delta : delta),
              };
        const clamped = clampIntervalToNeighbors(
          next,
          canvasSegments,
          activeCanvas.duration,
          selectedSegment.id,
        );
        updateTemporalRange(vault as any, selectedSegment, clamped);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeCanvas,
    currentTime,
    markStart,
    draft,
    selectedSegment,
    selectedRangeId,
    canvasSegments,
    togglePlay,
    seek,
    createFromDraft,
    splitAtPlayhead,
    deleteSelected,
    setDraft,
    setMarkStart,
    setSelectedRangeId,
    vault,
  ]);

  if (!canvases.length) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <WarningMessage>
          No audio or video canvases are available for temporal range editing.
        </WarningMessage>
      </div>
    );
  }

  if (!activeCanvas) {
    return null;
  }

  const isVideo = activeCanvas.media.type === "Video";

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-me-gray-50">
      {/* Canvas header bar */}
      <div className="bg-white border-b border-me-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold truncate leading-tight">
            {activeCanvas.title}
          </h2>
          <div className="text-xs text-me-gray-500 mt-0.5">
            {isVideo ? "Video" : "Audio"} ·{" "}
            <span className="tabular-nums">{formatTimeDisplay(activeCanvas.duration)}</span>
          </div>
        </div>
        {markStart !== null ? (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700 font-medium flex-shrink-0">
            <MarkInIcon />
            <span>
              Mark in: {formatTimeDisplay(markStart)} · press <kbd className="font-mono">O</kbd> to mark end
            </span>
          </div>
        ) : null}
      </div>

      {/* Unified player zone — media sits directly above transport controls with no gap */}
      <div className="flex-shrink-0 bg-white border-b border-me-gray-200">
        {isVideo ? (
          <div className="bg-black">
            <video
              ref={mediaRef as any}
              className="block w-full max-h-[38vh] object-contain"
              src={activeCanvas.media.id}
              preload="metadata"
              playsInline
              onTimeUpdate={(event: any) => {
                const t = event.currentTarget.currentTime;
                setCurrentTime(t);
                if (loopSelection && selectedSegment && t >= selectedSegment.end) {
                  seek(selectedSegment.start);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              {activeCanvas.captions.map((caption) => (
                <track
                  key={caption.id}
                  src={caption.id}
                  kind="subtitles"
                  srcLang={caption.language || "en"}
                  label={caption.language || "Captions"}
                />
              ))}
            </video>
          </div>
        ) : (
          <audio
            ref={mediaRef as any}
            src={activeCanvas.media.id}
            preload="metadata"
            className="hidden"
            onTimeUpdate={(event: any) => {
              const t = event.currentTarget.currentTime;
              setCurrentTime(t);
              if (loopSelection && selectedSegment && t >= selectedSegment.end) {
                seek(selectedSegment.start);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            {activeCanvas.captions.map((caption) => (
              <track
                key={caption.id}
                src={caption.id}
                kind="subtitles"
                srcLang={caption.language || "en"}
                label={caption.language || "Captions"}
              />
            ))}
          </audio>
        )}

        {/* Transport controls — flat bar, no separate card */}
        <TransportControls
          isVideo={isVideo}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={activeCanvas.duration}
          speed={speed}
          volume={volume}
          loopSelection={loopSelection}
          hasSelection={!!selectedSegment}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onSpeed={setSpeed}
          onVolume={setVolume}
          onPlaySelection={playSelection}
          onLoopSelection={setLoopSelection}
          onMarkStart={() => setMarkStart(currentTime)}
          onMarkEnd={() => {
            if (markStart === null) return;
            setDraft(
              snapInterval(
                {
                  start: Math.min(markStart, currentTime),
                  end: Math.max(markStart, currentTime),
                },
                canvasSegments,
                activeCanvas.duration,
              ),
            );
            setMarkStart(null);
          }}
          canMarkEnd={markStart !== null}
        />
      </div>

      {/* Timeline + action toolbar */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
        <Timeline
          canvas={activeCanvas}
          segments={canvasSegments}
          gaps={gaps}
          currentTime={currentTime}
          selectedRangeId={selectedRangeId}
          draft={draft}
          scale={timelineScale}
          dragRef={dragRef}
          onSeek={seek}
          onSelectRange={setSelectedRangeId}
          onDraft={setDraft}
          onCreateDraft={createFromDraft}
          onResizeRange={resizeRange}
          onMoveRange={moveRange}
          onScale={setTimelineScale}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <ActionButton isDisabled={!selectedSegment} onPress={playSelection}>
            <SelectionPlayIcon />
            Play selection
          </ActionButton>
          <ActionButton isDisabled={!selectedSegment} onPress={splitAtPlayhead}>
            <SplitAtPlayheadIcon />
            Split at playhead
          </ActionButton>
          <ActionButton isDisabled={!selectedSegment} onPress={deleteSelected}>
            <DeleteRangeIcon />
            Delete range
          </ActionButton>
          {activeCanvas.captions.length ? (
            <ActionButton onPress={() => setTranscriptOpen((open) => !open)}>
              <CaptionsIcon />
              {transcriptOpen ? "Hide captions" : "Show captions"}
            </ActionButton>
          ) : null}
        </div>

        {transcriptOpen && activeCanvas.captions[0] ? (
          <TranscriptLane
            captionUrl={activeCanvas.captions[0].id}
            currentTime={currentTime}
            onSeek={seek}
            onDraft={setDraft}
          />
        ) : null}
      </div>
    </div>
  );
}

function TransportControls(props: {
  isVideo: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  loopSelection: boolean;
  hasSelection: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSpeed: (speed: number) => void;
  onVolume: (volume: number) => void;
  onPlaySelection: () => void;
  onLoopSelection: (loop: boolean) => void;
  onMarkStart: () => void;
  onMarkEnd: () => void;
  canMarkEnd: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2 px-3 py-2.5",
        props.isVideo ? "border-t border-me-gray-200 bg-me-gray-50" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          primary
          large
          className="min-w-[92px]"
          onPress={props.onTogglePlay}
        >
          {props.isPlaying ? <PauseIcon /> : <PlayIcon />}
          {props.isPlaying ? "Pause" : "Play"}
        </ActionButton>
        <div className="flex items-center gap-0.5">
          <ActionButton onPress={() => props.onSeek(props.currentTime - 5)}>
            <SkipBackIcon />
            <span>-5s</span>
          </ActionButton>
          <ActionButton onPress={() => props.onSeek(props.currentTime + 5)}>
            <SkipForwardIcon />
            <span>+5s</span>
          </ActionButton>
        </div>
        <div className="rounded bg-me-gray-100 border border-me-gray-200 px-2.5 py-1 text-sm tabular-nums text-me-gray-700">
          {formatTimeDisplay(props.currentTime)} / {formatTimeDisplay(props.duration)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm flex items-center gap-1.5 text-me-gray-600">
          <span className="text-xs">Speed</span>
          <select
            value={props.speed}
            onChange={(event) =>
              props.onSpeed(Number(event.currentTarget.value))
            }
            className="bg-white border border-me-gray-300 rounded px-1 py-0.5 text-xs"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex items-center gap-1.5 text-me-gray-600">
          <VolumeIcon />
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.volume}
            onChange={(event) =>
              props.onVolume(Number(event.currentTarget.value))
            }
            className="w-20"
          />
        </label>
        <div className="flex items-center gap-0.5">
          <ActionButton onPress={props.onMarkStart}>
            <MarkInIcon />
            Mark in
          </ActionButton>
          <ActionButton
            isDisabled={!props.canMarkEnd}
            onPress={props.onMarkEnd}
          >
            <MarkOutIcon />
            Mark out
          </ActionButton>
        </div>
        <div className="flex items-center gap-0.5">
          <ActionButton
            isDisabled={!props.hasSelection}
            onPress={props.onPlaySelection}
          >
            <SelectionPlayIcon />
            Play selection
          </ActionButton>
          <label className="text-xs flex items-center gap-1.5 px-2 py-1 text-me-gray-600">
            <input
              type="checkbox"
              checked={props.loopSelection}
              disabled={!props.hasSelection}
              onChange={(event) =>
                props.onLoopSelection(event.currentTarget.checked)
              }
            />
            Loop
          </label>
        </div>
      </div>
    </div>
  );
}

function ControlIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

function PlayIcon() {
  return (
    <ControlIcon>
      <path d="M6 4.5v11l9-5.5-9-5.5Z" />
    </ControlIcon>
  );
}

function PauseIcon() {
  return (
    <ControlIcon>
      <path d="M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" />
    </ControlIcon>
  );
}

function SkipBackIcon() {
  return (
    <ControlIcon>
      <path d="M5 4h2v12H5V4Zm10.5 1v10L8 10l7.5-5Z" />
    </ControlIcon>
  );
}

function SkipForwardIcon() {
  return (
    <ControlIcon>
      <path d="M13 4h2v12h-2V4ZM4.5 5 12 10l-7.5 5V5Z" />
    </ControlIcon>
  );
}

function VolumeIcon() {
  return (
    <ControlIcon>
      <path d="M3 7.5h3L10 4v12l-4-3.5H3v-5Zm10.2-.7 1.2-1.2A6 6 0 0 1 16 10a6 6 0 0 1-1.6 4.4l-1.2-1.2A4.2 4.2 0 0 0 14.3 10c0-1.2-.4-2.3-1.1-3.2Z" />
    </ControlIcon>
  );
}

function MarkInIcon() {
  return (
    <ControlIcon>
      <path d="M5 4h2v12H5V4Zm5 3h6v2h-6V7Zm0 4h4v2h-4v-2Z" />
    </ControlIcon>
  );
}

function MarkOutIcon() {
  return (
    <ControlIcon>
      <path d="M13 4h2v12h-2V4ZM4 7h6v2H4V7Zm2 4h4v2H6v-2Z" />
    </ControlIcon>
  );
}

function SplitAtPlayheadIcon() {
  return (
    <ControlIcon>
      <path d="M10 4h2v5.5l3-3 1.4 1.4L12 12.3l4.4 4.4-1.4 1.4-3-3V20h-2v-5.7l-3 3-1.4-1.4L9.9 12 6.5 8.7l1.4-1.4 2.1 2.1V4Z" />
    </ControlIcon>
  );
}

function DeleteRangeIcon() {
  return (
    <ControlIcon>
      <path d="M6 15h3L4.5 19 0 15h3V5h3v10Zm4-9h7v2h-7V6Zm0 4h5v2h-5v-2Zm0 4h3v2h-3v-2Z" />
    </ControlIcon>
  );
}

function CaptionsIcon() {
  return (
    <ControlIcon>
      <path d="M2 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2Zm2 5h2v1H4V9Zm0 2h6v1H4v-1Zm7 0h5v1h-5v-1Zm1-2h4v1h-4V9ZM4 7h12v1H4V7Z" />
    </ControlIcon>
  );
}

function SelectionPlayIcon() {
  return (
    <ControlIcon>
      <path d="M4 5h2v10H4V5Zm10 0h2v10h-2V5ZM8 6.5l5 3.5-5 3.5v-7Z" />
    </ControlIcon>
  );
}

function Timeline({
  canvas,
  segments,
  gaps,
  currentTime,
  selectedRangeId,
  draft,
  scale,
  dragRef,
  onSeek,
  onSelectRange,
  onDraft,
  onCreateDraft,
  onResizeRange,
  onMoveRange,
  onScale,
}: {
  canvas: AvCanvas;
  segments: TemporalRangeSegment[];
  gaps: Array<{ start: number; end: number }>;
  currentTime: number;
  selectedRangeId: string | null;
  draft: { start: number; end: number } | null;
  scale: number;
  dragRef: React.MutableRefObject<{ start: number; end: number } | null>;
  onSeek: (time: number) => void;
  onSelectRange: (id: string) => void;
  onDraft: (draft: { start: number; end: number } | null) => void;
  onCreateDraft: () => void;
  onResizeRange: (
    rangeId: string,
    interval: { start: number; end: number },
  ) => { start: number; end: number } | null;
  onMoveRange: (rangeId: string, start: number) => void;
  onScale: (scale: number) => void;
}) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const rangeLaneRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<{
    edge: "start" | "end";
    pointerId: number;
    segment: TemporalRangeSegment;
  } | null>(null);
  const moveRef = useRef<{
    pointerId: number;
    segment: TemporalRangeSegment;
    offset: number;
    moved: boolean;
  } | null>(null);
  const suppressSegmentClickRef = useRef(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [resizingRangeId, setResizingRangeId] = useState<string | null>(null);
  const [movingRangeId, setMovingRangeId] = useState<string | null>(null);
  const { major: majorTicks, minor: minorTicks } = useMemo(
    () => createTimelineTicks(canvas.duration, scale),
    [canvas.duration, scale],
  );
  const toPercent = (time: number) =>
    `${Math.max(0, Math.min(100, (time / canvas.duration) * 100))}%`;
  const eventToTime = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(
        canvas.duration,
        ((event.clientX - rect.left) / rect.width) * canvas.duration,
      ),
    );
  };
  const clientXToRangeTime = (clientX: number) => {
    const rect = rangeLaneRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(
      0,
      Math.min(
        canvas.duration,
        ((clientX - rect.left) / rect.width) * canvas.duration,
      ),
    );
  };

  return (
    <div className="rounded-lg border border-me-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center justify-end gap-3">
        <label className="flex items-center gap-2 text-xs text-me-gray-500">
          Zoom
          <input
            aria-label="Timeline zoom"
            type="range"
            min={1}
            max={8}
            step={1}
            value={scale}
            onChange={(event) => onScale(Number(event.currentTarget.value))}
          />
          <span className="w-6 tabular-nums">{scale}x</span>
        </label>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="min-w-full"
          style={{ width: `${Math.max(1, scale) * 100}%` }}
        >
          <TimelineHeader
            duration={canvas.duration}
            major={majorTicks}
            toPercent={toPercent}
          />
          <div className="text-[10px] font-medium text-me-gray-400 uppercase tracking-wider mb-1">Overview</div>
          <div
            ref={timelineRef}
            className="relative h-8 rounded bg-me-gray-100 border border-me-gray-300 overflow-hidden"
            style={{ height: 32, minHeight: 32 }}
            onPointerDown={(event) =>
              onSeek(snapTime(eventToTime(event), segments, canvas.duration))
            }
            onPointerMove={(event) => setHoverTime(eventToTime(event))}
            onPointerLeave={() => setHoverTime(null)}
          >
            <TimelineTicks major={majorTicks} minor={minorTicks} toPercent={toPercent} />
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="absolute top-1 bottom-1 rounded-sm bg-me-primary-300"
                style={{
                  left: toPercent(segment.start),
                  width: toPercent(segment.end - segment.start),
                }}
              />
            ))}
            {hoverTime !== null ? (
              <HoverTime time={hoverTime} duration={canvas.duration} />
            ) : null}
            <Playhead currentTime={currentTime} duration={canvas.duration} />
          </div>

          <div className="mt-3 text-[10px] font-medium text-me-gray-400 uppercase tracking-wider mb-1">Ranges</div>
          <div
            ref={rangeLaneRef}
            className="relative h-28 rounded bg-me-gray-50 border border-me-gray-300 select-none overflow-hidden"
            style={{ height: 112, minHeight: 112 }}
            onPointerDown={(event) => {
              const time = snapTime(
                eventToTime(event),
                segments,
                canvas.duration,
              );
              dragRef.current = { start: time, end: time };
              event.currentTarget.setPointerCapture(event.pointerId);
              onDraft({ start: time, end: time });
            }}
            onPointerMove={(event) => {
              setHoverTime(eventToTime(event));
              const resize = resizeRef.current;
              if (resize) {
                const time = snapTime(
                  eventToTime(event),
                  segments.filter(
                    (segment) => segment.id !== resize.segment.id,
                  ),
                  canvas.duration,
                );
                const resized = onResizeRange(
                  resize.segment.id,
                  resize.edge === "start"
                    ? { start: time, end: resize.segment.end }
                    : { start: resize.segment.start, end: time },
                );
                if (resized) {
                  onSeek(resize.edge === "start" ? resized.start : resized.end);
                }
                return;
              }
              const move = moveRef.current;
              if (move) {
                const rawStart =
                  clientXToRangeTime(event.clientX) - move.offset;
                const start = snapMovedStart(
                  rawStart,
                  move.segment,
                  segments,
                  canvas.duration,
                );
                move.moved = true;
                onMoveRange(move.segment.id, start);
                return;
              }
              if (!dragRef.current) return;
              const time = snapTime(
                eventToTime(event),
                segments,
                canvas.duration,
              );
              dragRef.current.end = time;
              onDraft(
                snapInterval(
                  {
                    start: Math.min(dragRef.current.start, time),
                    end: Math.max(dragRef.current.start, time),
                  },
                  segments,
                  canvas.duration,
                ),
              );
            }}
            onPointerLeave={() => {
              if (!resizeRef.current && !moveRef.current && !dragRef.current) {
                setHoverTime(null);
              }
            }}
            onPointerUp={(event) => {
              if (resizeRef.current) {
                const pointerId = resizeRef.current.pointerId;
                resizeRef.current = null;
                setResizingRangeId(null);
                if (event.currentTarget.hasPointerCapture(pointerId)) {
                  event.currentTarget.releasePointerCapture(pointerId);
                }
                return;
              }
              if (moveRef.current) {
                const pointerId = moveRef.current.pointerId;
                suppressSegmentClickRef.current = moveRef.current.moved;
                moveRef.current = null;
                setMovingRangeId(null);
                if (event.currentTarget.hasPointerCapture(pointerId)) {
                  event.currentTarget.releasePointerCapture(pointerId);
                }
                return;
              }
              const current = dragRef.current;
              dragRef.current = null;
              if (!current) return;
              const start = Math.min(current.start, current.end);
              const end = Math.max(current.start, current.end);
              if (end - start < 0.15) {
                const gap = gaps.find(
                  (item) => start >= item.start && start <= item.end,
                );
                onDraft(gap ? { start: gap.start, end: gap.end } : null);
              }
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
          >
            <TimelineTicks major={majorTicks} minor={minorTicks} toPercent={toPercent} />
            {gaps.map((gap) => (
              <button
                key={`${gap.start}-${gap.end}`}
                type="button"
                className="absolute top-0 h-full bg-white/50 hover:bg-me-primary-50 border-x border-dashed border-me-gray-300"
                style={{
                  left: toPercent(gap.start),
                  width: toPercent(gap.end - gap.start),
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDraft({ start: gap.start, end: gap.end });
                }}
                aria-label={`Create range from gap ${formatTimeDisplay(gap.start)} to ${formatTimeDisplay(gap.end)}`}
              />
            ))}
            {segments.map((segment) => (
              <button
                key={segment.id}
                type="button"
                className={[
                  "absolute top-5 bottom-5 rounded-sm px-2 text-left overflow-hidden border shadow-sm group",
                  selectedRangeId === segment.id ||
                  resizingRangeId === segment.id ||
                  movingRangeId === segment.id
                    ? "bg-me-primary-500 text-white border-me-primary-700"
                    : "bg-me-primary-200 border-me-primary-400 text-me-gray-900",
                ].join(" ")}
                style={{
                  left: toPercent(segment.start),
                  width: toPercent(segment.end - segment.start),
                  minWidth: 54,
                  cursor: selectedRangeId === segment.id ? "move" : "pointer",
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelectRange(segment.id);
                  if (selectedRangeId !== segment.id) return;
                  const offset =
                    clientXToRangeTime(event.clientX) - segment.start;
                  moveRef.current = {
                    pointerId: event.pointerId,
                    segment,
                    offset,
                    moved: false,
                  };
                  setMovingRangeId(segment.id);
                  rangeLaneRef.current?.setPointerCapture(event.pointerId);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (suppressSegmentClickRef.current) {
                    suppressSegmentClickRef.current = false;
                    return;
                  }
                  onSelectRange(segment.id);
                  onSeek(segment.start);
                }}
                title={`${segment.title}: ${formatTimeDisplay(segment.start)} to ${formatTimeDisplay(segment.end)}`}
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/10 hover:bg-black/25"
                  aria-hidden="true"
                  style={{ cursor: "ew-resize" }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectRange(segment.id);
                    resizeRef.current = {
                      edge: "start",
                      pointerId: event.pointerId,
                      segment,
                    };
                    setResizingRangeId(segment.id);
                    rangeLaneRef.current?.setPointerCapture(event.pointerId);
                  }}
                />
                <span
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/10 hover:bg-black/25"
                  aria-hidden="true"
                  style={{ cursor: "ew-resize" }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectRange(segment.id);
                    resizeRef.current = {
                      edge: "end",
                      pointerId: event.pointerId,
                      segment,
                    };
                    setResizingRangeId(segment.id);
                    rangeLaneRef.current?.setPointerCapture(event.pointerId);
                  }}
                />
                <span className="block truncate text-xs font-semibold leading-4">
                  {segment.title}
                </span>
                <span className="block truncate text-[10px] leading-4 opacity-80 tabular-nums">
                  {formatTimeDisplay(segment.start)} - {formatTimeDisplay(segment.end)}
                </span>
              </button>
            ))}
            {draft ? (
              <>
                <div
                  className="absolute top-3 bottom-3 border-2 border-me-primary-700 bg-me-primary-200/70 pointer-events-none rounded-sm"
                  style={{
                    left: toPercent(draft.start),
                    width: toPercent(draft.end - draft.start),
                    minWidth: 4,
                  }}
                />
                <div
                  className="absolute top-1 z-20 rounded bg-white border border-me-primary-500 shadow-md p-1 flex gap-1 items-center"
                  style={{
                    left: toPercent((draft.start + draft.end) / 2),
                    transform: "translateX(-50%)",
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <span className="text-xs tabular-nums whitespace-nowrap">
                    {formatTimeDisplay(draft.start)} - {formatTimeDisplay(draft.end)}
                  </span>
                  <ActionButton primary onPress={onCreateDraft}>
                    Create
                  </ActionButton>
                </div>
              </>
            ) : null}
            <Playhead currentTime={currentTime} duration={canvas.duration} />
          </div>
        </div>
      </div>
    </div>
  );
}

function createTimelineTicks(duration: number, scale = 1): { major: number[]; minor: number[] } {
  const niceSteps = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];

  // Target more labels as the user zooms in; base of 14 gives comfortable density at 1×.
  const targetMajor = Math.round(14 * scale);
  const maxMinor = Math.round(60 * scale);

  // Major ticks (labelled): pick the finest "nice" step that yields ≤ targetMajor labels
  const rawMajorStep = duration / targetMajor;
  const majorStep = niceSteps.find((s) => s >= rawMajorStep) ?? niceSteps[niceSteps.length - 1]!;

  // Minor ticks: finest step that (a) divides evenly into majorStep and (b) yields ≤ maxMinor ticks
  let minorStep = majorStep;
  for (const s of niceSteps) {
    if (s >= majorStep) break;
    const ratio = majorStep / s;
    const isWhole = Math.abs(Math.round(ratio) - ratio) < 0.001;
    if (isWhole && duration / s <= maxMinor) {
      minorStep = s;
      break;
    }
  }

  const major: number[] = [];
  const minor: number[] = [];
  const majorEvery = Math.round(majorStep / minorStep);
  const eps = minorStep * 0.01;

  for (let i = 0; i * minorStep <= duration + eps; i++) {
    const t = Math.round(Math.min(i * minorStep, duration) * 1000) / 1000;
    if (minor.length > 0 && t === minor[minor.length - 1]) break;
    minor.push(t);
    if (i % majorEvery === 0) major.push(t);
    if (t >= duration) break;
  }

  // Always include the end of the media as a minor tick
  if ((minor[minor.length - 1] ?? -1) < duration) {
    minor.push(duration);
    major.push(duration);
  }

  // Drop the duration label if it's too close to the preceding major label —
  // prevents the right-aligned end label from running into the one before it.
  // "Too close" = gap is less than 55% of the major step.
  if (major.length >= 2 && major[major.length - 1] === duration) {
    const gap = duration - (major[major.length - 2] ?? 0);
    if (gap < majorStep * 0.55) {
      major.pop();
    }
  }

  return { major, minor };
}

function TimelineHeader({
  duration,
  major,
  toPercent,
}: {
  duration: number;
  major: number[];
  toPercent: (time: number) => string;
}) {
  return (
    <div className="relative h-5 text-[11px] text-me-gray-700 select-none">
      {major.map((time) => {
        const isFirst = time === 0;
        const isLast = time === duration;
        const transform = isFirst
          ? "translateX(0)"
          : isLast
            ? "translateX(-100%)"
            : "translateX(-50%)";
        return (
          <span
            key={time}
            className="absolute top-0 tabular-nums"
            style={{ left: toPercent(time), transform }}
          >
            {formatTimeDisplay(time)}
          </span>
        );
      })}
    </div>
  );
}

function TimelineTicks({
  major,
  minor,
  toPercent,
}: {
  major: number[];
  minor: number[];
  toPercent: (time: number) => string;
}) {
  const majorSet = new Set(major);
  return (
    <>
      {minor.map((time) =>
        majorSet.has(time) ? (
          <div
            key={time}
            className="absolute top-0 bottom-0 border-l border-me-gray-300/80"
            style={{ left: toPercent(time) }}
          />
        ) : (
          <div
            key={time}
            className="absolute top-1/4 bottom-0 border-l border-me-gray-200/70"
            style={{ left: toPercent(time) }}
          />
        ),
      )}
    </>
  );
}

function HoverTime({ time, duration }: { time: number; duration: number }) {
  const left = `${Math.max(0, Math.min(100, (time / duration) * 100))}%`;
  return (
    <>
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none z-20"
        style={{ left, backgroundColor: "#111827" }}
      />
      <div
        className="absolute top-0 z-30 -translate-x-1/2 rounded px-1.5 py-0.5 text-[11px] tabular-nums pointer-events-none shadow"
        style={{ left, backgroundColor: "#111827", color: "#ffffff" }}
      >
        {formatTimeDisplay(time)}
      </div>
    </>
  );
}

function Playhead({
  currentTime,
  duration,
}: {
  currentTime: number;
  duration: number;
}) {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-600 pointer-events-none"
      style={{
        left: `${Math.max(0, Math.min(100, (currentTime / duration) * 100))}%`,
      }}
    />
  );
}

function TranscriptLane({
  captionUrl,
  currentTime,
  onSeek,
  onDraft,
}: {
  captionUrl: string;
  currentTime: number;
  onSeek: (time: number) => void;
  onDraft: (draft: { start: number; end: number }) => void;
}) {
  const [cues, setCues] = useState<
    Array<{ start: number; end: number; text: string }>
  >([]);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(captionUrl)
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) setCues(parseVtt(text));
      })
      .catch(() => {
        if (!cancelled) setCues([]);
      });
    return () => {
      cancelled = true;
    };
  }, [captionUrl]);

  if (!cues.length) {
    return <InfoMessage>Transcript could not be loaded.</InfoMessage>;
  }

  return (
    <div className="rounded border border-me-gray-300 bg-white p-3 max-h-72 overflow-y-auto">
      {cues.map((cue, index) => {
        const active = currentTime >= cue.start && currentTime <= cue.end;
        return (
          <button
            key={`${cue.start}-${index}`}
            type="button"
            className={[
              "block w-full text-left rounded p-2 text-sm",
              active ? "bg-me-primary-100" : "hover:bg-me-gray-100",
            ].join(" ")}
            onClick={() => onSeek(cue.start)}
            onPointerDown={() => {
              dragStart.current = cue.start;
            }}
            onPointerUp={() => {
              if (
                dragStart.current !== null &&
                dragStart.current !== cue.start
              ) {
                onDraft({
                  start: Math.min(dragStart.current, cue.start),
                  end: Math.max(dragStart.current, cue.end),
                });
              }
              dragStart.current = null;
            }}
          >
            <span className="text-xs text-me-gray-600 mr-2">
              {formatTimeDisplay(cue.start)}
            </span>
            {cue.text}
          </button>
        );
      })}
    </div>
  );
}

function parseVtt(input: string) {
  const blocks = input.replace(/\r/g, "").split(/\n\n+/);
  const cues: Array<{ start: number; end: number; text: string }> = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) continue;
    const [startRaw, endRaw] = lines[timingIndex]!.split("-->").map(
      (part) => part.trim().split(/\s+/)[0],
    );
    const start = parseVttTime(startRaw || "");
    const end = parseVttTime(endRaw || "");
    if (start === null || end === null) continue;
    cues.push({
      start,
      end,
      text: lines.slice(timingIndex + 1).join(" "),
    });
  }
  return cues;
}

function parseVttTime(value: string) {
  const parts = value.split(":");
  if (parts.length === 2) {
    const minutes = Number.parseFloat(parts[0]!);
    const seconds = Number.parseFloat(parts[1]!);
    return Number.isFinite(minutes) && Number.isFinite(seconds)
      ? minutes * 60 + seconds
      : null;
  }
  if (parts.length === 3) {
    const hours = Number.parseFloat(parts[0]!);
    const minutes = Number.parseFloat(parts[1]!);
    const seconds = Number.parseFloat(parts[2]!);
    return Number.isFinite(hours) &&
      Number.isFinite(minutes) &&
      Number.isFinite(seconds)
      ? hours * 3600 + minutes * 60 + seconds
      : null;
  }
  return null;
}
