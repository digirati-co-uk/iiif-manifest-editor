import { ManifestEditor } from "manifest-editor";
import "manifest-editor/dist/index.css";
import "manifest-editor/reset.css";

import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch("https://digirati-co-uk.github.io/wunder.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <ManifestEditor resource={{ id: data.id, type: "Manifest" }} data={data} />
    </div>
  );
}

export default App;
