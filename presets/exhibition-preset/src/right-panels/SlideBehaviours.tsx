import { Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
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
    component: (existing, setBehaviors) => <EditSize behaviors={existing} setBehaviors={setBehaviors} />,
    label: { en: ["Size"] },
    type: "custom",
    initialOpen: true,
    supports: (b) => b.startsWith("w-") || b.startsWith("h-"),
  },
];

export function RoundGridIcon(props: { index: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
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

function EditSize({ behaviors, setBehaviors }: { behaviors: string[]; setBehaviors: (behaviors: string[]) => void }) {
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
    <div className="grid grid-cols-12 grid-rows-12 gap-1" onMouseLeave={() => setHoverPosition({ x: -1, y: -1 })}>
      {cells}
    </div>
  );
}

function SlideBehavioursPanel() {
  const canvas = useInStack("Canvas");
  const editor = useEditor();
  const { width, height } = editor.technical;

  if (!canvas || editor.technical.type !== "Canvas") {
    return (
      <Sidebar>
        <SidebarHeader title="Slide behaviors" />
        <div>Please select canvas</div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  );
}
