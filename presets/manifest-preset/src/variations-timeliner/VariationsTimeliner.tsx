// Caption tracks are supplied dynamically from the canvas when available.
/* eslint-disable jsx-a11y/media-has-caption */
import { getValue } from "@iiif/helpers";
import { ActionButton, InfoMessage } from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { useCallback, useEffect, useRef, useState } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import styled from "styled-components";
import type { AvCanvas } from "../av-ranges/av-media-utils";
import { formatTime } from "../av-ranges/temporal-range-utils";
import { BubbleTimeline } from "./BubbleTimeline";
import { CreateFirstSection } from "./CreateFirstSection";
import { HelpBox } from "./HelpBox";
import { MarkerList } from "./MarkerList";
import { useTimelinerData } from "./data";
import {
  addMarker,
  canGroup,
  canSplit,
  groupSections,
  moveBoundary,
  removeSection,
  splitSection,
  type Bubble,
} from "./model";
import { MAX_ZOOM, MIN_ZOOM, useTimelinerStore } from "./store";
import { TransportControls } from "./TransportControls";
import { ThemePicker } from "./ThemePicker";

const View = styled.div`
  height: 100%;
  overflow: auto;
  /* Nothing here should ever scroll sideways; the timeline scrolls inside its own container. */
  overflow-x: hidden;
  background: #fff;
  color: #243047;
  padding-inline: var(--manifest-editor-layout-left-sidebar-small, 0px)
    var(--manifest-editor-layout-right-sidebar-small, 0px);
  .vt-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 24px;
    border-bottom: 1px solid #e2e8f0;
  }
  .vt-header h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  .vt-header p,
  .vt-help {
    color: #64748b;
    font-size: 12px;
  }
  .vt-spacer {
    margin-inline-start: auto;
  }
  select,
  input,
  textarea {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 6px 8px;
    background: #fff;
    color: #243047;
  }
  input[type="range"] {
    padding: 0;
    accent-color: #2563eb;
  }
  label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }
  .vt-details {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    padding: 24px;
  }
  .vt-details > section {
    min-width: 0;
  }
  /* Only the manifest title: nested headings (like the markers panel) style themselves. */
  .vt-details > section > h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .vt-details p {
    white-space: pre-wrap;
  }
  .vt-help {
    padding: 8px 24px;
  }
  .vt-error {
    padding: 8px 24px;
    color: #b91c1c;
  }
  video {
    width: 100%;
    max-height: 260px;
    background: #111;
  }
  @media (max-width: 700px) {
    .vt-details {
      grid-template-columns: 1fr;
    }
  }
`;

export function VariationsTimeliner() {
  const manifest = useManifest();
  if (!manifest) return <InfoMessage>Open a manifest to use Variations Timeliner.</InfoMessage>;
  return <Timeliner key={manifest.id} />;
}

function Timeliner() {
  const { canvases, canvas } = useTimelinerData();
  const setCanvasId = useTimelinerStore((s) => s.setCanvasId);
  if (!canvas)
    return (
      <InfoMessage>
        Variations Timeliner needs a canvas with audio or video and a duration. Add media using the canvas editor.
      </InfoMessage>
    );
  return <CanvasTimeliner key={canvas.id} canvas={canvas} canvases={canvases} onCanvas={setCanvasId} />;
}

function CanvasTimeliner({
  canvas,
  canvases,
  onCanvas,
}: {
  canvas: AvCanvas;
  canvases: AvCanvas[];
  onCanvas: (id: string) => void;
}) {
  const vault = useVault();
  const { edit: openEditor } = useLayoutActions();
  const { manifest, bubbles, markers, palette } = useTimelinerData();
  const store = useTimelinerStore();
  const { selected, select, setTime, setSeek, setPlayback, speed, volume, muted, loop } = store;
  const zoom = store.zooms[canvas.id] ?? MIN_ZOOM;
  const media = useRef<HTMLMediaElement | null>(null);
  const timeRef = useRef(0);
  const [time, setLocalTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const selection = bubbles.filter((item) => selected.includes(item.id));
  const single = selection.length === 1 ? selection[0] : undefined;
  const project = vault.get({ id: manifest!.id, type: "Manifest" }) as any;

  useEffect(() => {
    if (media.current) media.current.playbackRate = speed;
  }, [speed]);
  useEffect(() => {
    if (media.current) {
      media.current.volume = volume;
      media.current.muted = muted;
    }
  }, [volume, muted]);
  // Drop selections for sections that no longer exist (e.g. after deleting in the editor).
  useEffect(() => {
    const live = selected.filter((id) => bubbles.some((item) => item.id === id));
    if (live.length !== selected.length) select(live);
  }, [bubbles, selected, select]);

  const getTime = useCallback(() => media.current?.currentTime ?? timeRef.current, []);

  function seek(value: number) {
    const next = Math.max(0, Math.min(canvas.duration, value));
    if (media.current) media.current.currentTime = next;
    timeRef.current = next;
    setLocalTime(next);
    setTime(next);
  }
  // Let the sidebar and section editor move the playhead.
  const seekRef = useRef(seek);
  seekRef.current = seek;
  useEffect(() => {
    setSeek((value) => seekRef.current(value));
    return () => {
      setSeek(null);
      setTime(0);
    };
  }, [setSeek, setTime]);

  async function play() {
    try {
      setError("");
      await media.current?.play();
    } catch {
      setError("The media could not be played. Check the media URL and access permissions.");
    }
  }
  function togglePlay() {
    if (playing) media.current?.pause();
    else void play();
  }
  function choose(bubble: Bubble, multiple: boolean) {
    select(
      multiple
        ? selected.includes(bubble.id)
          ? selected.filter((id) => id !== bubble.id)
          : [...selected, bubble.id]
        : [bubble.id]
    );
    if (!multiple) seek(bubble.start);
  }
  function split() {
    const target = single || bubbles.find((item) => !item.children.length && time > item.start && time < item.end);
    if (!target) return;
    const id = splitSection(vault, target, canvas.id, time);
    if (id) select([id]);
  }
  function adjacent(direction: -1 | 1) {
    const leaves = bubbles.filter((item) => !item.children.length).sort((a, b) => a.start - b.start);
    const index = leaves.findIndex((item) => item.id === single?.id);
    const next = leaves[Math.max(0, Math.min(leaves.length - 1, index + direction))];
    if (next) choose(next, false);
  }
  const setZoom = (value: number) => store.setZoom(canvas.id, Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)));
  const mediaProps = {
    src: canvas.media.id,
    onTimeUpdate: () => {
      const player = media.current;
      if (!player) return;
      if (single && player.currentTime >= single.end && loop) player.currentTime = single.start;
      timeRef.current = player.currentTime;
      setLocalTime(player.currentTime);
      setTime(player.currentTime);
    },
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
    onError: () => setError("Unable to load this media. Check its URL and access permissions."),
    onLoadedMetadata: () => {
      if (media.current) {
        media.current.volume = volume;
        media.current.muted = muted;
        media.current.playbackRate = speed;
      }
    },
  };
  const splittable = !!(single ? canSplit(vault, single, time) : bubbles.some((item) => canSplit(vault, item, time)));
  const captions = canvas.captions
    .filter((track) => track.format === "text/vtt" || track.id.endsWith(".vtt"))
    .map((track, i) => (
      <track
        key={track.id}
        src={track.id}
        kind="captions"
        srcLang={track.language || "en"}
        label={getValue(track.label) || "Captions"}
        default={i === 0}
      />
    ));

  return (
    <View
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, textarea, select, button, [contenteditable=true], [role=button], [role=slider]"))
          return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        let handled = true;
        // Shortcuts follow the Theseus player: k/space play, j/l ±10s, arrows ±5s, m mute, 0-9 jump.
        if (key === " " || key === "k") togglePlay();
        else if (key === "ArrowLeft") seek(time - 5);
        else if (key === "ArrowRight") seek(time + 5);
        else if (key === "j") seek(time - 10);
        else if (key === "l") seek(time + 10);
        else if (key === "ArrowUp") setPlayback({ volume: Math.min(1, volume + 0.05), muted: false });
        else if (key === "ArrowDown") setPlayback({ volume: Math.max(0, volume - 0.05) });
        else if (key === "m") setPlayback({ muted: !muted });
        else if (key === "Home") seek(0);
        else if (key === "End") seek(canvas.duration);
        else if (key === "[") adjacent(-1);
        else if (key === "]") adjacent(1);
        else if (/^[0-9]$/.test(key)) seek((Number(key) / 10) * canvas.duration);
        else handled = false;
        if (handled) event.preventDefault();
      }}
      tabIndex={0}
      aria-label="Variations Timeliner"
    >
      <header className="vt-header">
        <div>
          <h1>Variations Timeliner</h1>
          <p>Explore and annotate the structure of audio and video</p>
        </div>
        <span className="vt-spacer" />
        {canvases.length > 1 && (
          <select aria-label="Media canvas" value={canvas.id} onChange={(e) => onCanvas(e.target.value)}>
            {canvases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        )}
        <ThemePicker />
      </header>

      {!bubbles.length ? (
        <CreateFirstSection canvas={canvas} />
      ) : (
        <>
          <BubbleTimeline
            canvas={canvas}
            bubbles={bubbles}
            markers={markers}
            selected={selected}
            time={time}
            getTime={getTime}
            playing={playing}
            zoom={zoom}
            height={store.viewportHeight}
            palette={palette}
            background={store.background}
            square={store.square}
            monochrome={store.monochrome}
            onHeightChange={store.setViewportHeight}
            onChoose={choose}
            onSeek={seek}
            onClearSelection={() => select([])}
            onMoveBoundary={(from, to) => moveBoundary(vault, bubbles, canvas.id, from, to, canvas.duration)}
          />
          <TransportControls
            time={time}
            duration={canvas.duration}
            playing={playing}
            volume={volume}
            muted={muted}
            speed={speed}
            loop={loop}
            zoom={zoom}
            canSplit={splittable}
            canGroup={canGroup(selection)}
            canDelete={!!single}
            onTogglePlay={togglePlay}
            onSeekBy={(seconds) => seek(time + seconds)}
            onAdjacent={adjacent}
            onVolume={(next) => setPlayback({ volume: next, muted: false })}
            onToggleMute={() => setPlayback({ muted: !muted })}
            onSpeed={(next) => setPlayback({ speed: next })}
            onLoop={(next) => setPlayback({ loop: next })}
            onAddMarker={() => addMarker(vault, project, canvas.id, time)}
            onSplit={split}
            onGroup={() => {
              const id = groupSections(vault, selection);
              if (id) select([id]);
            }}
            onDelete={() => {
              if (single) {
                removeSection(vault, single);
                select([]);
              }
            }}
            onZoom={setZoom}
          />
        </>
      )}
      {error && (
        <p role="alert" className="vt-error">
          {error}
        </p>
      )}
      <div className="vt-details">
        <section>
          <h2>{getValue(project.label) || "Untitled manifest"}</h2>
          <p>{getValue(project.summary)}</p>
          <ActionButton onPress={() => openEditor({ id: manifest!.id, type: "Manifest" }, {}, { forceOpen: true })}>
            Edit manifest metadata
          </ActionButton>
          {canvas.media.type === "Video" ? (
            <video
              key={canvas.media.id}
              ref={(node) => {
                media.current = node;
              }}
              {...mediaProps}
              controls
              playsInline
            >
              {captions}
            </video>
          ) : (
            <audio
              key={canvas.media.id}
              ref={(node) => {
                media.current = node;
              }}
              {...mediaProps}
            >
              {captions}
            </audio>
          )}
          <HelpBox />
        </section>
        <section>
          <MarkerList
            markers={markers}
            time={time}
            onSeek={seek}
            onAdd={() => addMarker(vault, project, canvas.id, time)}
          />
        </section>
      </div>
    </View>
  );
}
