import { Sidebar, SidebarHeader } from "@manifest-editor/components";
import {
  BehaviorEditor,
  type BehaviorEditorProps,
  useInStack,
} from "@manifest-editor/editors";
import {
  type EditorDefinition,
  type LayoutPanel,
  useEditor,
} from "@manifest-editor/shell";
import { useState } from "react";

export const slideBehaviours: LayoutPanel = {
  id: "slide-behaviors",
  label: "Slide behaviors",
  icon: <>🐙</>,
  render: () => <SlideBehavioursPanel />,
};

export const customBehaviourEditor: EditorDefinition = {
  component: () => <SlideBehavioursPanel />,
  supports: {
    edit: true,
    resourceTypes: ["Canvas"],
    properties: ["behavior"],
  },
  id: "slide-behaviors",
  label: "Slide behaviors",
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
        label: { en: ["Only image"] },
        value: "image",
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

function EditSize({
  behaviors,
  setBehaviors,
}: { behaviors: string[]; setBehaviors: (behaviors: string[]) => void }) {
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

function SlideBehavioursPanel() {
  const canvas = useInStack("Canvas");
  const editor = useEditor();

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
      <SidebarHeader title="Slide behaviors" />
      <BehaviorEditor
        behavior={editor.technical.behavior.get()}
        onChange={(v) => {
          editor.technical.behavior.set(v);
        }}
        configs={exhibitionConfigs}
      />
    </Sidebar>
  );
}
