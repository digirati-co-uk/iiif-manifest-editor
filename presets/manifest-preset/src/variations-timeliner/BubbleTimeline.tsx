// SVG shapes need ARIA roles because HTML controls cannot be children of SVG.
/* eslint-disable jsx-a11y/prefer-tag-over-role */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import type { AvCanvas } from "../av-ranges/av-media-utils";
import { formatTime } from "../av-ranges/temporal-range-utils";
import { bubblePath, type Bubble, type Marker } from "./model";
import { TimeText } from "./TimeText";
import { MAX_VIEWPORT_HEIGHT, MIN_VIEWPORT_HEIGHT } from "./store";
import { bubbleColour, readableTextColour, type ColourPalette } from "./themes";

/** Horizontal inset so the thumb and playhead are never clipped at either end of the timeline. */
const PAD = 14;
const RAIL_HEIGHT = 28;
const AXIS_HEIGHT = 40;
const TOP_PADDING = 18;
const TICK_STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];

const Frame = styled.div`
  position: relative;
  --vt-accent: #2563eb;
  &[data-dark="true"] {
    --vt-accent: #60a5fa;
  }
  .vt-scroll {
    overflow-x: auto;
    overflow-y: hidden;
  }
  /* Bubbles and the scrubber rail share this surface, so one x position means one time for both. */
  .vt-surface {
    position: relative;
  }
  svg {
    display: block;
    user-select: none;
  }
  /* Selection is shown on the bubble itself; never draw the browser's focus box around the SVG group. */
  svg g,
  svg circle,
  svg rect {
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .vt-bubble path {
    transition:
      stroke-width 120ms ease,
      filter 120ms ease;
  }
  .vt-bubble:hover path {
    filter: brightness(0.95);
  }
  .vt-bubble:focus-visible path,
  .vt-boundary:focus-visible,
  .vt-marker:focus-visible line {
    stroke: #1d4ed8;
    stroke-width: 3px;
  }

  /* Scrubber rail, modelled on the Theseus audio player: a thin track that thickens on hover. */
  .vt-rail {
    position: relative;
    height: ${RAIL_HEIGHT}px;
    cursor: pointer;
    touch-action: none;
    border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  }
  .vt-rail-track {
    position: absolute;
    left: ${PAD}px;
    right: ${PAD}px;
    top: 50%;
    height: 4px;
    margin-top: -2px;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, currentColor 22%, transparent);
    transition:
      height 120ms ease,
      margin-top 120ms ease;
  }
  .vt-rail:hover .vt-rail-track,
  .vt-rail[data-active="true"] .vt-rail-track {
    height: 6px;
    margin-top: -3px;
  }
  .vt-rail:focus-within .vt-rail-track {
    outline: 2px solid var(--vt-accent);
    outline-offset: 3px;
  }
  .vt-rail-fill {
    height: 100%;
    width: 0;
    background: var(--vt-accent);
  }
  .vt-rail-range {
    position: absolute;
    top: 50%;
    height: 12px;
    margin-top: -6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--vt-accent) 28%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vt-accent) 70%, transparent);
    pointer-events: none;
  }
  /* The thumb element is only positioned (transform: translateX). Anything that scales it on hover must
     happen on the inner dot: the standalone \`scale\` property is applied outside \`transform\`, so it would
     multiply the translation and push the thumb away from the playhead line when zoomed in. */
  .vt-thumb {
    position: absolute;
    left: 0;
    top: 50%;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    pointer-events: none;
    will-change: transform;
    /* Above the playhead line (z-index 3), so the dot is not cut in two by the line passing through it. */
    z-index: 4;
  }
  .vt-thumb::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--vt-accent);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.85),
      0 1px 3px rgba(0, 0, 0, 0.35);
    transition: transform 120ms ease;
  }
  .vt-rail:hover .vt-thumb::after,
  .vt-rail[data-active="true"] .vt-thumb::after {
    transform: scale(1.3);
  }
  .vt-range-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }
  .vt-tooltip {
    position: absolute;
    bottom: ${RAIL_HEIGHT + 4}px;
    transform: translateX(-50%);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    background: #1f2937;
    color: #fff;
    pointer-events: none;
    z-index: 5;
  }

  /* One line for the playhead and one for the pointer; each crosses the bubbles and the rail together. */
  .vt-playhead,
  .vt-hover-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }
  .vt-playhead {
    width: 2px;
    margin-left: -1px;
    background: var(--vt-accent);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
    will-change: transform;
    z-index: 3;
  }
  .vt-playhead::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid var(--vt-accent);
  }
  .vt-hover-line {
    width: 1px;
    margin-left: -0.5px;
    background: currentColor;
    opacity: 0.5;
    z-index: 2;
  }

  .vt-grip {
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ns-resize;
    touch-action: none;
    background: rgba(100, 116, 139, 0.08);
    border-top: 1px solid rgba(100, 116, 139, 0.25);
    outline: none;
  }
  .vt-grip::after {
    content: "";
    width: 36px;
    height: 3px;
    border-radius: 2px;
    background: rgba(100, 116, 139, 0.55);
  }
  .vt-grip:hover,
  .vt-grip:focus-visible,
  .vt-grip[data-dragging="true"] {
    background: rgba(37, 99, 235, 0.14);
  }
  @media (prefers-reduced-motion: reduce) {
    .vt-bubble path,
    .vt-rail-track,
    .vt-thumb::after {
      transition: none;
    }
  }
`;

/** Eases a numeric value toward its target so zooming glides rather than jumps. */
export function useAnimatedZoom(target: number, duration = 260) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof requestAnimationFrame !== "function" || current.current === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      // Interpolate multiplicatively so each zoom step feels even.
      current.current = progress >= 1 ? target : from * (target / from) ** eased;
      setValue(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function trimTime(value: number) {
  return formatTime(value).replace(/\.000$/, "");
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export interface BubbleTimelineProps {
  canvas: AvCanvas;
  bubbles: Bubble[];
  markers: Marker[];
  selected: string[];
  /** Playhead as last published by React state; only used while paused. */
  time: number;
  /** Live media time, read every animation frame during playback for a smooth playhead. */
  getTime: () => number;
  playing: boolean;
  zoom: number;
  height: number;
  palette: ColourPalette;
  background: string;
  square: boolean;
  monochrome: boolean;
  onHeightChange: (height: number) => void;
  onChoose: (bubble: Bubble, multiple: boolean) => void;
  onSeek: (time: number) => void;
  onMoveBoundary: (from: number, to: number) => void;
  onClearSelection?: () => void;
}

export function BubbleTimeline(props: BubbleTimelineProps) {
  const { canvas, bubbles, markers, selected, zoom, height, palette, square, monochrome } = props;
  const { time, getTime, playing } = props;
  const scroll = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const playheadEl = useRef<HTMLDivElement>(null);
  const thumbEl = useRef<HTMLDivElement>(null);
  const fillEl = useRef<HTMLDivElement>(null);
  const anchor = useRef<number | null>(null);
  const clientWidth = useElementWidth(scroll) || 1000;
  const displayZoom = useAnimatedZoom(zoom);
  const [boundaryDrag, setBoundaryDrag] = useState<{ from: number; to: number } | null>(null);
  const [resizing, setResizing] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);

  // The one mapping between time and pixels, shared by the bubbles, the rail, and both lines.
  const surfaceWidth = clientWidth * displayZoom;
  const width = surfaceWidth - PAD * 2;
  const x = (value: number) => PAD + (value / canvas.duration) * width;
  const geometry = useRef({ width, duration: canvas.duration, animating: false });
  geometry.current = { width, duration: canvas.duration, animating: displayZoom !== zoom };
  const latest = useRef(props);
  latest.current = props;

  function timeFromClientX(clientX: number) {
    const rect = surface.current!.getBoundingClientRect();
    return clamp(((clientX - rect.left - PAD) / width) * canvas.duration, 0, canvas.duration);
  }

  /** Position the playhead line, rail thumb and rail fill from one time; returns its x in the surface. */
  const applyPlayhead = useCallback((t: number) => {
    const { width: w, duration } = geometry.current;
    const px = PAD + (clamp(t, 0, duration) / duration) * w;
    if (playheadEl.current) playheadEl.current.style.transform = `translateX(${px}px)`;
    if (thumbEl.current) thumbEl.current.style.transform = `translateX(${px}px)`;
    if (fillEl.current) fillEl.current.style.width = `${px - PAD}px`;
    return px;
  }, []);

  // Remember what was in the middle of the viewport so zooming grows around it.
  useLayoutEffect(() => {
    const element = scroll.current;
    if (element && element.scrollWidth > 0) {
      anchor.current = (element.scrollLeft + element.clientWidth / 2) / element.scrollWidth;
    }
  }, [zoom]);
  useLayoutEffect(() => {
    const element = scroll.current;
    if (!element || anchor.current === null) return;
    element.scrollLeft = anchor.current * element.scrollWidth - element.clientWidth / 2;
    if (displayZoom === zoom) anchor.current = null;
  }, [displayZoom, zoom]);

  // Lines and thumb follow the time on every layout change (zoom, resize) as well as on every seek.
  useLayoutEffect(() => {
    applyPlayhead(playing ? getTime() : time);
  }, [applyPlayhead, playing, time, getTime, width, canvas.duration]);

  // After a seek while paused, bring the playhead into view if it landed off-screen.
  useLayoutEffect(() => {
    const element = scroll.current;
    if (!element || playing) return;
    const px = applyPlayhead(time);
    if (px < element.scrollLeft + PAD || px > element.scrollLeft + element.clientWidth - PAD) {
      element.scrollLeft = Math.max(0, px - element.clientWidth / 2);
    }
    // Only when the time changes: zooming has its own anchoring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  // While playing, drive the playhead from the media element each frame, and follow it when zoomed in.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const last = { px: -1, left: -1 };
    const tick = () => {
      const px = applyPlayhead(latest.current.getTime());
      const element = scroll.current;
      if (element && !geometry.current.animating) {
        const { scrollLeft, clientWidth: visible } = element;
        const edge = scrollLeft + visible - 24;
        const untouched = last.left === scrollLeft && last.px >= 0;
        if (untouched && last.px <= edge && px > edge) {
          // Playback ran off the right edge: turn the page.
          element.scrollLeft = Math.max(0, px - 48);
        } else if (untouched && Math.abs(px - last.px) > 120 && (px < scrollLeft || px > scrollLeft + visible)) {
          // A jump (loop restart, section chosen elsewhere): re-centre on the new position.
          element.scrollLeft = Math.max(0, px - visible / 2);
        }
        last.px = px;
        last.left = element.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, applyPlayhead]);

  const levels = Math.max(3, ...bubbles.map((item) => item.height));
  const baseline = height - AXIS_HEIGHT;
  const unit = Math.max(16, (baseline - TOP_PADDING) / levels);

  const step = TICK_STEPS.find((candidate) => candidate >= canvas.duration / Math.max(2, width / 110)) || 7200;
  const ticks: number[] = [];
  for (let t = 0; t <= canvas.duration + 0.0001; t += step) ticks.push(t);

  const boundaries = Array.from(new Set(bubbles.filter((b) => !b.children.length).flatMap((b) => [b.start, b.end])))
    .filter((point) => point > 0 && point < canvas.duration)
    .sort((a, b) => a - b);

  const dark = readableTextColour(props.background) === "#ffffff";
  const tooltipLeft = (() => {
    if (hover === null) return 0;
    const element = scroll.current;
    const px = x(hover);
    return element ? clamp(px, element.scrollLeft + 36, element.scrollLeft + element.clientWidth - 36) : px;
  })();

  function edgeScroll(clientX: number) {
    const element = scroll.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (clientX < rect.left + 32) element.scrollLeft -= 16;
    else if (clientX > rect.right - 32) element.scrollLeft += 16;
  }

  return (
    <Frame data-dark={dark} style={{ background: props.background, color: readableTextColour(props.background) }}>
      <div className="vt-scroll" ref={scroll}>
        <div className="vt-surface" ref={surface} style={{ width: surfaceWidth }}>
          <svg
            width={surfaceWidth}
            height={height}
            aria-label="Section bubbles and timeline"
            onPointerDown={(event) => {
              // Clicking the axis scrubs; clicking empty space clears the selection.
              if (event.target !== event.currentTarget && (event.target as Element).getAttribute("data-scrub") === null)
                return;
              const rect = event.currentTarget.getBoundingClientRect();
              if (event.clientY - rect.top >= baseline - 4) props.onSeek(timeFromClientX(event.clientX));
              else props.onClearSelection?.();
            }}
          >
            <rect data-scrub="" x={0} y={0} width={surfaceWidth} height={height} fill="transparent" />
            <g transform={`translate(0 ${baseline})`} style={monochrome ? { filter: "grayscale(1)" } : undefined}>
              {[...bubbles]
                .sort((a, b) => b.height - a.height)
                .map((bubble) => {
                  const left = x(bubble.start);
                  const w = x(bubble.end) - left;
                  const h = bubble.height * unit;
                  const isSelected = selected.includes(bubble.id);
                  const fill = bubbleColour(palette, bubble.height, bubble.colour);
                  const label = bubble.title;
                  const fits = Math.max(0, Math.floor((w - 12) / 6.6));
                  return (
                    <g
                      key={bubble.id}
                      className="vt-bubble"
                      role="button"
                      tabIndex={0}
                      aria-label={`${bubble.title}, ${formatTime(bubble.start)} to ${formatTime(bubble.end)}`}
                      aria-pressed={isSelected}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => props.onChoose(bubble, e.ctrlKey || e.metaKey || e.shiftKey)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onChoose(bubble, e.ctrlKey || e.metaKey || e.shiftKey);
                        }
                      }}
                    >
                      <path
                        d={bubblePath(left, w, h, square)}
                        fill={fill}
                        stroke={isSelected ? "#1d4ed8" : "rgba(15,23,42,0.35)"}
                        strokeWidth={isSelected ? 3 : 1}
                      >
                        <title>{bubble.title}</title>
                      </path>
                      {fits >= 3 && (
                        <text
                          x={left + w / 2}
                          y={-(h - unit / 2) + 4}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={isSelected ? 600 : 400}
                          fill={readableTextColour(fill)}
                          pointerEvents="none"
                        >
                          {label.length > fits ? `${label.slice(0, Math.max(1, fits - 1))}…` : label}
                        </text>
                      )}
                    </g>
                  );
                })}
            </g>
            <line
              x1={0}
              x2={surfaceWidth}
              y1={baseline}
              y2={baseline}
              stroke="currentColor"
              opacity={0.45}
              pointerEvents="none"
            />
            {ticks.map((t) => (
              <g key={t} transform={`translate(${x(t)} ${baseline})`} pointerEvents="none">
                <line y2={7} stroke="currentColor" opacity={0.45} />
                <text y={24} textAnchor={t === 0 ? "start" : "middle"} fontSize={11} fill="currentColor" opacity={0.7}>
                  {trimTime(t)}
                </text>
              </g>
            ))}
            {!bubbles.length && (
              <text
                x={surfaceWidth / 2}
                y={baseline / 2}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.6}
                fontSize={14}
              >
                Add a section to begin your timeline
              </text>
            )}
            {boundaries.map((point) => {
              const at = boundaryDrag?.from === point ? boundaryDrag.to : point;
              return (
                <circle
                  key={point}
                  className="vt-boundary"
                  cx={x(at)}
                  cy={baseline}
                  r={5}
                  fill="#475569"
                  stroke="#fff"
                  role="slider"
                  tabIndex={0}
                  aria-label={`Section boundary at ${formatTime(point)}`}
                  aria-valuemin={0}
                  aria-valuemax={canvas.duration}
                  aria-valuenow={at}
                  style={{ cursor: "ew-resize", touchAction: "none" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setBoundaryDrag({ from: point, to: point });
                  }}
                  onPointerMove={(e) => {
                    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                    setBoundaryDrag({ from: point, to: timeFromClientX(e.clientX) });
                    edgeScroll(e.clientX);
                  }}
                  onPointerUp={(e) => {
                    if (!boundaryDrag) return;
                    e.currentTarget.releasePointerCapture(e.pointerId);
                    props.onMoveBoundary(boundaryDrag.from, boundaryDrag.to);
                    setBoundaryDrag(null);
                  }}
                  onPointerCancel={() => setBoundaryDrag(null)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                      e.preventDefault();
                      e.stopPropagation();
                      props.onMoveBoundary(point, point + (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 0.1 : 1));
                    }
                  }}
                />
              );
            })}
            {markers.map((marker) => (
              <g
                key={marker.id}
                className="vt-marker"
                role="button"
                tabIndex={0}
                aria-label={`${marker.title} at ${formatTime(marker.time)}`}
                onClick={() => props.onSeek(marker.time)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onSeek(marker.time);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <line
                  x1={x(marker.time)}
                  x2={x(marker.time)}
                  y1={baseline - 20}
                  y2={baseline + 10}
                  stroke="#7c3aed"
                  strokeWidth={2}
                />
                <text x={x(marker.time)} y={baseline - 24} textAnchor="middle" fill="#7c3aed" fontSize={12}>
                  ◆<title>{marker.title}</title>
                </text>
              </g>
            ))}
          </svg>

          <div
            className="vt-rail"
            data-active={scrubbing}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setScrubbing(true);
              const t = timeFromClientX(e.clientX);
              setHover(t);
              props.onSeek(t);
            }}
            onPointerMove={(e) => {
              const t = timeFromClientX(e.clientX);
              setHover(t);
              if (scrubbing) {
                props.onSeek(t);
                edgeScroll(e.clientX);
              }
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture?.(e.pointerId);
              setScrubbing(false);
            }}
            onPointerCancel={() => {
              setScrubbing(false);
              setHover(null);
            }}
            onPointerLeave={() => {
              if (!scrubbing) setHover(null);
            }}
          >
            <div className="vt-rail-track">
              <div className="vt-rail-fill" ref={fillEl} />
            </div>
            {bubbles
              .filter((bubble) => selected.includes(bubble.id))
              .map((bubble) => (
                <div
                  key={bubble.id}
                  className="vt-rail-range"
                  style={{ left: x(bubble.start), width: x(bubble.end) - x(bubble.start) }}
                />
              ))}
            <div className="vt-thumb" ref={thumbEl}>
              <input
                className="vt-range-input"
                type="range"
                aria-label="Seek playback"
                aria-valuetext={`${formatTime(time)} of ${formatTime(canvas.duration)}`}
                min={0}
                max={canvas.duration}
                step={1}
                value={Math.min(time, canvas.duration)}
                onChange={(e) => props.onSeek(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="vt-playhead" ref={playheadEl} aria-hidden="true" />
          {hover !== null && (
            <>
              <div className="vt-hover-line" style={{ transform: `translateX(${x(hover)}px)` }} aria-hidden="true" />
              <div className="vt-tooltip" style={{ left: tooltipLeft }} aria-hidden="true">
                <TimeText value={hover} />
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className="vt-grip"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize bubble viewport"
        aria-valuemin={MIN_VIEWPORT_HEIGHT}
        aria-valuemax={MAX_VIEWPORT_HEIGHT}
        aria-valuenow={height}
        tabIndex={0}
        data-dragging={resizing}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setResizing(true);
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const top = e.currentTarget.parentElement!.getBoundingClientRect().top;
          props.onHeightChange(clamp(e.clientY - top - RAIL_HEIGHT, MIN_VIEWPORT_HEIGHT, MAX_VIEWPORT_HEIGHT));
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setResizing(false);
        }}
        onPointerCancel={() => setResizing(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const delta = (e.key === "ArrowUp" ? -1 : 1) * (e.shiftKey ? 5 : 24);
            props.onHeightChange(clamp(height + delta, MIN_VIEWPORT_HEIGHT, MAX_VIEWPORT_HEIGHT));
          }
        }}
      />
    </Frame>
  );
}
