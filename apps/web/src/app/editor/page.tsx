import dynamic from "next/dynamic";

const BrowserRecents = dynamic(() => import("../../components/browser-editor/BrowserRecents"), {
  ssr: false,
});

export default function EditorPage() {
  return <BrowserRecents />;
}
