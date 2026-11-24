export type FloatingBehavior =
  | "float-top-left"
  | "float-top"
  | "float-top-right"
  | "float-left"
  | "float-right"
  | "float-bottom-left"
  | "float-bottom"
  | "float-bottom-right";

export const floatingBehaviorOptions: Array<{ value: FloatingBehavior; label: string }> = [
  { value: "float-top-left", label: "Top left" },
  { value: "float-top", label: "Top centre" },
  { value: "float-top-right", label: "Top right" },
  { value: "float-left", label: "Centre left" },
  { value: "float-right", label: "Centre right" },
  { value: "float-bottom-left", label: "Bottom left" },
  { value: "float-bottom", label: "Bottom centre" },
  { value: "float-bottom-right", label: "Bottom right" },
];

export const floatingBehaviors = new Set<string>(floatingBehaviorOptions.map((option) => option.value));

export function hasFloatingBehavior(behavior: string[]) {
  return behavior.includes("floating") || behavior.some((item) => floatingBehaviors.has(item));
}

export function getFloatingBehavior(behavior: string[]): FloatingBehavior {
  return (
    [...behavior].reverse().find((item): item is FloatingBehavior => floatingBehaviors.has(item)) || "float-top-right"
  );
}

export const floatingPositionClasses: Record<FloatingBehavior, string> = {
  "float-top-left": "left-1 top-1",
  "float-top": "left-1/2 top-1 -translate-x-1/2",
  "float-top-right": "right-1 top-1",
  "float-left": "left-1 top-1/2 -translate-y-1/2",
  "float-right": "right-1 top-1/2 -translate-y-1/2",
  "float-bottom-left": "bottom-1 left-1",
  "float-bottom": "bottom-1 left-1/2 -translate-x-1/2",
  "float-bottom-right": "bottom-1 right-1",
};

const iconPositions: Record<FloatingBehavior, { x: number; y: number }> = {
  "float-top-left": { x: 2, y: 2 },
  "float-top": { x: 8.5, y: 2 },
  "float-top-right": { x: 15, y: 2 },
  "float-left": { x: 2, y: 8.5 },
  "float-right": { x: 15, y: 8.5 },
  "float-bottom-left": { x: 2, y: 15 },
  "float-bottom": { x: 8.5, y: 15 },
  "float-bottom-right": { x: 15, y: 15 },
};

export function FloatingPositionIcon({ position }: { position: "" | FloatingBehavior }) {
  return (
    <svg width="1.6em" height="1.6em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {position ? (
        <rect {...iconPositions[position]} width="7" height="7" rx="1.5" fill="currentColor" />
      ) : (
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      )}
    </svg>
  );
}

export function FloatingPositionPicker({
  value,
  onChange,
}: {
  value: "" | FloatingBehavior;
  onChange: (value: "" | FloatingBehavior) => void;
}) {
  const options = floatingGridWithCenter();

  return (
    <div className="grid w-fit grid-cols-3 gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value || "off"}
            type="button"
            title={option.label}
            aria-pressed={selected}
            className="flex min-h-11 items-center justify-center rounded-md border px-3 py-2 transition-colors"
            style={{
              backgroundColor: selected ? "var(--exhibition-primary, #b84c74)" : "#fff",
              borderColor: selected ? "var(--exhibition-primary, #b84c74)" : "#dcd5ce",
              color: selected ? "#fff" : "#332f2c",
            }}
            onClick={() => onChange(option.value)}
          >
            <FloatingPositionIcon position={option.value} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function floatingGridWithCenter(clearLabel = "No overlay") {
  return [
    ...floatingBehaviorOptions.slice(0, 4),
    { value: "" as const, label: clearLabel },
    ...floatingBehaviorOptions.slice(4),
  ];
}
