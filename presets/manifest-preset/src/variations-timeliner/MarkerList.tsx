import styled from "styled-components";
import { useVault } from "react-iiif-vault";
import { formatTime } from "../av-ranges/temporal-range-utils";
import { MarkerIcon, PlusIcon, TrashIcon } from "./icons";
import { removeMarker, type Marker } from "./model";
import { TimeText } from "./TimeText";

const Panel = styled.section`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  header svg {
    color: #7c3aed;
    font-size: 18px;
  }
  header h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
  .count {
    min-width: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #ede9fe;
    color: #5b21b6;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .add {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid #ddd6fe;
    border-radius: 999px;
    background: #fff;
    color: #5b21b6;
    font-size: 12px;
    cursor: pointer;
  }
  .add:hover {
    background: #f5f3ff;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 320px;
    overflow-y: auto;
  }
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 10px;
    border-inline-start: 3px solid transparent;
    border-bottom: 1px solid #f1f5f9;
  }
  li:last-child {
    border-bottom: 0;
  }
  li:hover {
    background: #faf5ff;
  }
  li[data-current="true"] {
    border-inline-start-color: #7c3aed;
    background: #faf5ff;
  }
  .time {
    flex: none;
    padding: 2px 8px;
    border: 0;
    border-radius: 4px;
    background: #f1f5f9;
    color: #243047;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
  .time:hover {
    background: #ede9fe;
  }
  .title {
    flex: 1;
    min-width: 0;
    padding: 4px 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font-size: 13px;
  }
  .title:hover {
    border-color: #e2e8f0;
  }
  .title:focus {
    border-color: #7c3aed;
    background: #fff;
    outline: none;
    box-shadow: 0 0 0 2px #ddd6fe;
  }
  .delete {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #64748b;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.55;
  }
  li:hover .delete,
  .delete:focus-visible {
    opacity: 1;
  }
  .delete:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
  button:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 1px;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin: 12px;
    padding: 20px 12px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    color: #64748b;
    font-size: 13px;
    text-align: center;
  }
  .empty svg {
    font-size: 24px;
    color: #a78bfa;
  }
`;

/** Markers for the canvas: jump to one, rename it in place, or remove it. */
export function MarkerList({
  markers,
  time,
  onSeek,
  onAdd,
}: {
  markers: Marker[];
  time: number;
  onSeek: (time: number) => void;
  onAdd: () => void;
}) {
  const vault = useVault();
  // The marker the playhead has most recently passed.
  const current = [...markers].reverse().find((marker) => marker.time <= time)?.id;
  return (
    <Panel aria-label="Markers">
      <header>
        <MarkerIcon />
        <h2>Markers</h2>
        <span className="count">{markers.length}</span>
        <button type="button" className="add" aria-label="Add marker at playhead" onClick={onAdd}>
          <PlusIcon /> At playhead
        </button>
      </header>
      {markers.length ? (
        <ul>
          {markers.map((marker) => (
            <li key={marker.id} data-current={marker.id === current}>
              <button
                type="button"
                className="time"
                aria-label={`Go to ${marker.title} at ${formatTime(marker.time)}`}
                onClick={() => onSeek(marker.time)}
              >
                <TimeText value={marker.time} />
              </button>
              <input
                className="title"
                aria-label={`Marker title at ${formatTime(marker.time)}`}
                defaultValue={marker.title}
                key={`${marker.id}-${marker.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                onBlur={(e) => {
                  const ref = { id: marker.id, type: "Annotation" } as const;
                  const annotation = vault.get(ref) as any;
                  const lang = Object.keys(annotation.label || {})[0] || "en";
                  vault.modifyEntityField(ref, "label", { ...annotation.label, [lang]: [e.target.value] });
                }}
              />
              <button
                type="button"
                className="delete"
                aria-label={`Delete marker ${marker.title}`}
                onClick={() => removeMarker(vault, marker)}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <MarkerIcon />
          <strong>No markers yet</strong>
          <span>Markers flag points in time, such as a cue or a page turn. Add one at the playhead.</span>
        </div>
      )}
    </Panel>
  );
}
