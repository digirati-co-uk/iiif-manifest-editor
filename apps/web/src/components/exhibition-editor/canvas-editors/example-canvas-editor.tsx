import { CanvasEditorDefinition } from "@manifest-editor/shell";
import { RenderingStrategy } from "react-iiif-vault";

export const exampleCanvasEditor: CanvasEditorDefinition = {
  id: "example-canvas-editor",
  label: "Example Canvas Editor",
  component: (strategy) => <ExampleCanvasEditor strategy={strategy} />,
  supports: {
    strategy: (strategy) => {
      // Uncomment to try out the example
      // if (strategy.type === 'textual-content') {
      //   return true;
      // }
      return false;
    }
  }
}

function ExampleCanvasEditor({ strategy }: { strategy: RenderingStrategy }) {
  return <div>
    Example Canvas Editor
    {JSON.stringify(strategy, null, 2)}
  </div>
}
