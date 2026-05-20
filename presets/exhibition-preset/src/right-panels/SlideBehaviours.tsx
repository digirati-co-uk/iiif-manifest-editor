import { Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  BehaviorEditor,
  type BehaviorEditorProps,
  DimensionsTriplet,
  InputContainer,
  useInStack,
} from "@manifest-editor/editors";
import { type EditorDefinition, useEditor } from "@manifest-editor/shell";
import { useState } from "react";
import { AspectRatioWarning } from "../components/AspectRatioWarning";

type EditingMode = "simple" | "advanced";
type LayoutEditingContext = "default" | "slideshow";
type LayoutPreset = "image-text" | "image-only";
type TextPosition = "left" | "right" | "bottom";
type DisplaySize = "compact" | "standard" | "large";

const textPositions: TextPosition[] = ["left", "right", "bottom"];
const layoutBehaviors = new Set(["left", "right", "bottom", "top", "image"]);
const sizeBehaviorPrefixes = ["w-", "h-"];
const layoutPresetOptions: Array<{ value: LayoutPreset; label: string }> = [
  { value: "image-text", label: "Image with text" },
  { value: "image-only", label: "Image only" },
];
const simpleLayoutColours = {
  primary: "#b84c74",
  fieldBorder: "#dcd5ce",
  fieldBackground: "#f8f6f3",
  text: "#25211f",
  muted: "#6a625c",
  buttonText: "#ffffff",
  inactiveButtonText: "#332f2c",
};
const displaySizeOptions: Array<{
  value: DisplaySize;
  label: string;
  behaviors: [string, string];
}> = [
  { value: "compact", label: "Compact slide", behaviors: ["w-6", "h-4"] },
  { value: "standard", label: "Standard slide", behaviors: ["w-8", "h-6"] },
  { value: "large", label: "Large feature slide", behaviors: ["w-12", "h-8"] },
];

export const customBehaviourEditor: EditorDefinition = {
  component: () => <SlideBehavioursPanel />,
  supports: {
    edit: true,
    resourceTypes: ["Canvas"],
    properties: ["behavior"],
  },
  id: "slide-behaviors",
  label: "Layout",
  tabs: {
    showTitle: true,
  },
};

const exhibitionConfigs: BehaviorEditorProps["configs"] = [
  {
    id: "layout",
    type: "choice",
    label: { en: ["Layout"] },
    initialOpen: true,
    items: [
      {
        label: { en: ["Text on left"] },
        value: "left",
      },
      {
        label: { en: ["Text on right"] },
        value: "right",
      },
      {
        label: { en: ["Text on bottom"] },
        value: "bottom",
      },
      {
        label: { en: ["Text on top"] },
        value: "top",
      },
      {
        label: { en: ["Only image"] },
        value: "image",
      },
    ],
  },
  {
    id: "floating",
    type: "choice",
    label: { en: ["Floating"] },
    initialOpen: false,
    addNone: true,
    groupBehavior: "floating",
    items: [
      {
        label: { en: ["Float top left"] },
        value: "float-top-left",
      },
      {
        label: { en: ["Float top right"] },
        value: "float-top-right",
      },
      {
        label: { en: ["Float bottom left"] },
        value: "float-bottom-left",
      },
      {
        label: { en: ["Float bottom right"] },
        value: "float-bottom-right",
      },
    ],
  },
  {
    id: "size",
    component: (existing, setBehaviors) => (
      <EditSize behaviors={existing} setBehaviors={setBehaviors} />
    ),
    label: { en: ["Size"] },
    type: "custom",
    initialOpen: true,
    supports: (b) => b.startsWith("w-") || b.startsWith("h-"),
  },
];

export function RoundGridIcon(
  props: { index: number } & React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill={props.index === 0 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M5 11h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
      <path
        fill={props.index === 1 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M5 21h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
      <path
        fill={props.index === 2 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M13 5v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2"
      />
      <path
        fill={props.index === 3 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M15 21h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
    </svg>
  );
}

function parseBehaviors(items: string[]) {
  let width = 0;
  let height = 0;

  for (const item of items) {
    if (item.startsWith("w-")) {
      width = Number.parseInt(item.slice(2));
    }
    if (item.startsWith("h-")) {
      height = Number.parseInt(item.slice(2));
    }
  }

  return {
    width,
    height,
  };
}

function removeLayoutBehaviors(behavior: string[]) {
  return behavior.filter(
    (item) =>
      !layoutBehaviors.has(item) &&
      !sizeBehaviorPrefixes.some((prefix) => item.startsWith(prefix)),
  );
}

function EditSize({
  behaviors,
  setBehaviors,
}: {
  behaviors: string[];
  setBehaviors: (behaviors: string[]) => void;
}) {
  const { width, height } = parseBehaviors(behaviors);
  const [hoverPosition, setHoverPosition] = useState({ x: -1, y: -1 });

  const setBehavior = (w: number, h: number) => {
    const newBehaviors = behaviors.filter((b) => {
      return !b.startsWith("w-") && !b.startsWith("h-");
    });

    newBehaviors.push(`w-${w}`);
    newBehaviors.push(`h-${h}`);

    setBehaviors(newBehaviors);
  };

  const cells = Array.from({ length: 144 }, (_, i) => {
    const x = i % 12;
    const y = Math.floor(i / 12);
    const hovered = hoverPosition.x >= x && hoverPosition.y >= y;
    const selected = x < width && y < height;
    const hoveredAndSelected = hovered && selected;

    let bgClass = "bg-gray-200";
    if (hovered) {
      bgClass = "bg-me-200";
    }
    if (selected) {
      bgClass = "bg-me-500";
    }
    if (hoveredAndSelected) {
      bgClass = "bg-me-400";
    }

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div
        key={i}
        className={`flex aspect-square rounded cursor-se-resize items-center justify-center ${bgClass}`}
        onClick={() => setBehavior(x + 1, y + 1)}
        onMouseUp={() => setBehavior(x + 1, y + 1)}
        onMouseEnter={() => setHoverPosition({ x, y })}
      />
    );
  });

  return (
    <div
      className="grid grid-cols-12 grid-rows-12 gap-1"
      onMouseLeave={() => setHoverPosition({ x: -1, y: -1 })}
    >
      {cells}
    </div>
  );
}

export function SlideBehavioursPanel() {
  return (
    <Sidebar>
      <SidebarContent>
        <SlideBehavioursContent mode="advanced" />
      </SidebarContent>
    </Sidebar>
  );
}

export function SlideBehavioursContent({
  mode = "advanced",
  layoutContext = "default",
}: {
  mode?: EditingMode;
  layoutContext?: LayoutEditingContext;
}) {
  const canvas = useInStack("Canvas");
  const editor = useEditor();
  const { width, height } = editor.technical;

  if (!canvas || editor.technical.type !== "Canvas") {
    return <div className="p-4">Please select canvas</div>;
  }

  if (mode === "simple") {
    return (
      <SimpleSlideLayoutEditor
        behavior={editor.technical.behavior.get() || []}
        layoutContext={layoutContext}
        onChange={(v) => {
          editor.technical.behavior.set(v);
        }}
      />
    );
  }

  return (
    <>
      <div className="px-2">
        <InputContainer $wide>
          <DimensionsTriplet
            widthId={width.containerId()}
            width={width.get() || 0}
            changeWidth={(v) => width.set(v)}
            heightId={height.containerId()}
            height={height.get() || 0}
            changeHeight={(v) => height.set(v)}
          />
          <div>
            <AspectRatioWarning />
          </div>
        </InputContainer>
      </div>

      <BehaviorEditor
        behavior={editor.technical.behavior.get() || []}
        onChange={(v) => {
          editor.technical.behavior.set(v);
        }}
        configs={exhibitionConfigs}
      />
    </>
  );
}

function SimpleSlideLayoutEditor({
  behavior,
  layoutContext,
  onChange,
}: {
  behavior: string[];
  layoutContext: LayoutEditingContext;
  onChange: (newValue: string[]) => void;
}) {
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>("image-text");
  const [displaySize, setDisplaySize] = useState<DisplaySize>(
    getDisplaySize(behavior),
  );
  const [textPosition, setTextPosition] = useState<TextPosition>(
    getTextPosition(behavior),
  );

  const applyLayout = () => {
    const size =
      layoutContext === "slideshow"
        ? displaySizeOptions.find((option) => option.value === "large")
        : displaySizeOptions.find((option) => option.value === displaySize);
    const next = removeLayoutBehaviors(behavior);

    next.push(layoutPreset === "image-text" ? textPosition : "image");

    if (size) {
      next.push(...size.behaviors);
    }

    onChange(next);
  };

  return (
    <div className="flex flex-col gap-8">
      <SimpleField>
        <SimpleFieldLabel>Layout preset</SimpleFieldLabel>
        <select
          className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
          style={{
            backgroundColor: simpleLayoutColours.fieldBackground,
            borderColor: simpleLayoutColours.fieldBorder,
            color: simpleLayoutColours.text,
          }}
          value={layoutPreset}
          onChange={(e) =>
            setLayoutPreset(e.currentTarget.value as LayoutPreset)
          }
        >
          {layoutPresetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SimpleField>

      {layoutContext === "default" ? (
        <SimpleField>
          <SimpleFieldLabel>Display size</SimpleFieldLabel>
          <select
            className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
            style={{
              backgroundColor: simpleLayoutColours.fieldBackground,
              borderColor: simpleLayoutColours.fieldBorder,
              color: simpleLayoutColours.text,
            }}
            value={displaySize}
            onChange={(e) =>
              setDisplaySize(e.currentTarget.value as DisplaySize)
            }
          >
            {displaySizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SimpleField>
      ) : null}

      {layoutPreset === "image-text" ? (
        <SimpleField>
          <SimpleFieldLabel>Text position</SimpleFieldLabel>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {textPositions.map((position) => {
              const selected = textPosition === position;

              return (
                <button
                  key={position}
                  type="button"
                  className="rounded-md border px-3 py-3 text-sm font-semibold capitalize transition-colors"
                  style={{
                    backgroundColor: selected
                      ? simpleLayoutColours.primary
                      : simpleLayoutColours.buttonText,
                    borderColor: selected
                      ? simpleLayoutColours.primary
                      : simpleLayoutColours.fieldBorder,
                    color: selected
                      ? simpleLayoutColours.buttonText
                      : simpleLayoutColours.inactiveButtonText,
                  }}
                  onClick={() => setTextPosition(position)}
                >
                  {position}
                </button>
              );
            })}
          </div>
        </SimpleField>
      ) : null}

      <button
        type="button"
        className="mt-4 w-fit rounded-md px-7 py-3 text-sm font-semibold text-white"
        style={{ backgroundColor: simpleLayoutColours.primary }}
        onClick={applyLayout}
      >
        Apply slide layout
      </button>
    </div>
  );
}

function SimpleField({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SimpleFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-sm font-semibold"
      style={{ color: simpleLayoutColours.muted }}
    >
      {children}
    </div>
  );
}

function getTextPosition(behavior: string[]): TextPosition {
  if (behavior.includes("left")) return "left";
  if (behavior.includes("bottom")) return "bottom";
  return "right";
}

function getDisplaySize(behavior: string[]): DisplaySize {
  const { width, height } = parseBehaviors(behavior);

  if (width >= 10 || height >= 8) return "large";
  if (width >= 8 || height >= 6) return "standard";
  return "compact";
}
