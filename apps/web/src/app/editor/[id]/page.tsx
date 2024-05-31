import dynamic from "next/dynamic";

const BrowserEditor = dynamic(() => import("../../../components/browser-editor/BrowserEditor"), {
  ssr: false,
});

export default function EditorPage({ params }: { params: { id: string } }) {
  return <BrowserEditor id={params.id} />;
}
