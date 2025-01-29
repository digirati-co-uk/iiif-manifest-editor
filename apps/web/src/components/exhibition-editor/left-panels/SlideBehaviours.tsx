import { useInStack, BehaviorEditor, BehaviorEditorProps } from "@manifest-editor/editors";
import { LayoutPanel, useEditor } from "@manifest-editor/shell";

export const slideBehaviours: LayoutPanel = {
  id: 'slide-behaviours',
  label: 'Slide behaviours',
  icon: <>🐙</>,
  render: () => <SlideBehavioursPanel />,
};

const exhibitionConfigs: BehaviorEditorProps['configs'] = [
  {
    id: 'layout',
    type: 'choice',
    label: { en: ['Layout'] },
    items: [
      {
        label: { en: ['Text on left'] },
        value: 'left',

      },
      {
        label: { en: ['Text on right'] },
        value: 'right',

      }, {
        label: { en: ['Text on bottom'] },
        value: 'bottom',

      },
      {
        label: { en: ['Only image'] },
        value: 'image',
      }
    ],
  }
];

function SlideBehavioursPanel() {
  const canvas = useInStack("Canvas");
  const editor = useEditor();

  if (!canvas || editor.technical.type !== "Canvas") {
    return <div>Please select canvas</div>;
  }


  return (
    <div>Canvas!
      <BehaviorEditor
        behavior={editor.technical.behavior.get()}
        onChange={(v) => editor.technical.behavior.set(v)}
        configs={exhibitionConfigs}
      />
    </div>
  );
}
