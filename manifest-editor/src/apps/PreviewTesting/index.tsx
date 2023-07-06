import { LayoutPanel } from "@/shell";
import { usePreviewContext } from "@/shell";
import { useProjectContext } from "@/shell";

export default { id: "preview-testing", title: "Preview testing", project: true, dev: true };

function TestingPreview() {
  const { current } = useProjectContext();
  const { active, selected, configs, actions } = usePreviewContext();
  return (
    <div>
      <h1>Testing preview</h1>
      <button disabled={!selected} onClick={() => actions.updatePreviews()}>
        Preview (update)
      </button>
      {configs.map((config) => {
        return (
          <div key={config.id}>
            [{selected === config.id ? "selected" : "deselected"}] [
            {active.indexOf(config.id) === -1 ? "inactive" : "active"}] {config.label}
            <button onClick={() => actions.selectPreview(config.id)}>activate</button>
            <button onClick={() => actions.deletePreview(config.id)}>delete</button>
          </div>
        );
      })}
      <pre>{JSON.stringify(configs, null, 2)}</pre>
      <pre>{JSON.stringify(current?.previews, null, 2)}</pre>
    </div>
  );
}

export const centerPanels: LayoutPanel[] = [
  {
    id: "testing-preview",
    label: "Testing preview",
    icon: null,
    render: () => <TestingPreview />,
  },
];
