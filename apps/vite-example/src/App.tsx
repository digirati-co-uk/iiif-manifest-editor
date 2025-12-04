import "manifest-editor/reset.css";
import "manifest-editor/dist/index.css";
import { ManifestEditor } from "manifest-editor";

function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ManifestEditor resource="https://digirati-co-uk.github.io/wunder.json" />
    </div>
  );
}

export default App;
