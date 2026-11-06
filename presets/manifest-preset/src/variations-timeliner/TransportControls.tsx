import { useState, type ButtonHTMLAttributes } from "react";
import styled from "styled-components";
import {
  FitIcon,
  GroupIcon,
  LoopIcon,
  MarkerIcon,
  MuteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  SeekBackIcon,
  SeekForwardIcon,
  SplitIcon,
  TrashIcon,
  VolumeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./icons";
import { MAX_ZOOM, MIN_ZOOM } from "./store";
import { TimeText } from "./TimeText";

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 4px;
  padding: 6px 12px 8px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  color: #243047;
  .vt-spacer {
    flex: 1;
  }
  .vt-divider {
    width: 1px;
    height: 22px;
    margin: 0 6px;
    background: #cbd5e1;
  }
  .vt-time {
    margin-inline: 6px;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .vt-time span {
    opacity: 0.6;
  }
  .vt-btn-wrap {
    position: relative;
    display: inline-flex;
  }
  .vt-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
    touch-action: manipulation;
  }
  .vt-btn:hover:not(:disabled) {
    background: rgba(15, 23, 42, 0.09);
  }
  .vt-btn:focus-visible,
  select:focus-visible,
  input[type="range"]:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }
  .vt-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .vt-btn[aria-pressed="true"] {
    background: #dbeafe;
    color: #1d4ed8;
  }
  .vt-btn[data-primary="true"] {
    width: 42px;
    height: 42px;
    background: #2563eb;
    color: #fff;
    font-size: 22px;
  }
  .vt-btn[data-primary="true"]:hover:not(:disabled) {
    background: #1d4ed8;
  }
  .vt-btn[data-danger="true"]:hover:not(:disabled) {
    background: #fee2e2;
    color: #b91c1c;
  }
  .vt-tip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 8px;
    border-radius: 4px;
    background: #1f2937;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 30;
  }
  .vt-tip[data-align="end"] {
    left: auto;
    right: 0;
    transform: none;
  }
  .vt-tip span {
    opacity: 0.6;
    margin-inline-start: 4px;
  }
  .vt-volume {
    display: flex;
    align-items: center;
  }
  .vt-volume input {
    width: 0;
    opacity: 0;
    margin: 0;
    padding: 0;
    accent-color: #2563eb;
    cursor: pointer;
    transition:
      width 150ms ease,
      opacity 150ms ease,
      margin 150ms ease;
  }
  .vt-volume:hover input,
  .vt-volume:focus-within input {
    width: 80px;
    opacity: 1;
    margin: 0 8px 0 2px;
  }
  .vt-speed {
    height: 30px;
    padding: 0 8px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #fff;
    color: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  @media (prefers-reduced-motion: reduce) {
    .vt-volume input {
      transition: none;
    }
  }
`;

/** Round icon button with a tooltip that shows its keyboard shortcut, as in the Theseus player. */
function IconButton({
  label,
  shortcut,
  primary,
  danger,
  pressed,
  align,
  children,
  onClick,
  ...props
}: {
  label: string;
  shortcut?: string;
  primary?: boolean;
  danger?: boolean;
  pressed?: boolean;
  /** Tooltip alignment; use "end" for the last button so it stays inside the bar. */
  align?: "center" | "end";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">) {
  const [tip, setTip] = useState(false);
  return (
    <span
      className="vt-btn-wrap"
      onPointerEnter={() => setTip(true)}
      onPointerLeave={() => setTip(false)}
      onBlur={() => setTip(false)}
    >
      <button
        type="button"
        className="vt-btn"
        aria-label={label}
        aria-keyshortcuts={shortcut}
        aria-pressed={pressed}
        data-primary={primary}
        data-danger={danger}
        onFocus={(e) => setTip(e.currentTarget.matches(":focus-visible"))}
        onClick={(e) => {
          setTip(false);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
      {tip && !props.disabled ? (
        <span className="vt-tip" role="presentation" data-align={align}>
          {label}
          {shortcut ? <span>({shortcut})</span> : null}
        </span>
      ) : null}
    </span>
  );
}

export interface TransportControlsProps {
  time: number;
  duration: number;
  playing: boolean;
  volume: number;
  muted: boolean;
  speed: number;
  loop: boolean;
  zoom: number;
  canSplit: boolean;
  canGroup: boolean;
  canDelete: boolean;
  onTogglePlay: () => void;
  onSeekBy: (seconds: number) => void;
  onAdjacent: (direction: -1 | 1) => void;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
  onSpeed: (speed: number) => void;
  onLoop: (loop: boolean) => void;
  onAddMarker: () => void;
  onSplit: () => void;
  onGroup: () => void;
  onDelete: () => void;
  onZoom: (zoom: number) => void;
}

export function TransportControls(props: TransportControlsProps) {
  const { playing, muted, volume, zoom } = props;
  return (
    <Bar role="toolbar" aria-label="Playback and editing controls">
      <IconButton label="Previous section" shortcut="[" onClick={() => props.onAdjacent(-1)}>
        <PreviousIcon />
      </IconButton>
      <IconButton label="Back five seconds" shortcut="←" onClick={() => props.onSeekBy(-5)}>
        <SeekBackIcon />
      </IconButton>
      <IconButton label={playing ? "Pause" : "Play"} shortcut="k" primary onClick={props.onTogglePlay}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </IconButton>
      <IconButton label="Forward five seconds" shortcut="→" onClick={() => props.onSeekBy(5)}>
        <SeekForwardIcon />
      </IconButton>
      <IconButton label="Next section" shortcut="]" onClick={() => props.onAdjacent(1)}>
        <NextIcon />
      </IconButton>

      <div className="vt-volume">
        <IconButton label={muted ? "Unmute" : "Mute"} shortcut="m" onClick={props.onToggleMute}>
          {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={100}
          step={5}
          aria-valuetext={`${muted ? 0 : Math.round(volume * 100)}%`}
          value={muted ? 0 : Math.round(volume * 100)}
          onChange={(e) => props.onVolume(Number(e.currentTarget.value) / 100)}
        />
      </div>

      <span className="vt-time" aria-hidden="true">
        <TimeText value={props.time} /> <span>/</span>{" "}
        <span>
          <TimeText value={props.duration} />
        </span>
      </span>

      <span className="vt-spacer" />

      <select
        className="vt-speed"
        aria-label="Playback speed"
        value={props.speed}
        onChange={(e) => props.onSpeed(Number(e.target.value))}
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
          <option key={n} value={n}>
            {n}×
          </option>
        ))}
      </select>
      <IconButton label="Loop section" pressed={props.loop} onClick={() => props.onLoop(!props.loop)}>
        <LoopIcon />
      </IconButton>

      <span className="vt-divider" aria-hidden="true" />

      <IconButton label="Add marker" onClick={props.onAddMarker}>
        <MarkerIcon />
      </IconButton>
      <IconButton label="Split at playhead" disabled={!props.canSplit} onClick={props.onSplit}>
        <SplitIcon />
      </IconButton>
      <IconButton label="Group sections" disabled={!props.canGroup} onClick={props.onGroup}>
        <GroupIcon />
      </IconButton>
      <IconButton label="Delete section" danger disabled={!props.canDelete} onClick={props.onDelete}>
        <TrashIcon />
      </IconButton>

      <span className="vt-divider" aria-hidden="true" />

      <IconButton label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={() => props.onZoom(zoom / 1.5)}>
        <ZoomOutIcon />
      </IconButton>
      <IconButton label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => props.onZoom(zoom * 1.5)}>
        <ZoomInIcon />
      </IconButton>
      <IconButton label="Fit timeline" align="end" disabled={zoom === MIN_ZOOM} onClick={() => props.onZoom(MIN_ZOOM)}>
        <FitIcon />
      </IconButton>
    </Bar>
  );
}
