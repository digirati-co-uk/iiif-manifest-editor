import dynamic from "next/dynamic";

const LocalEditor = dynamic(() => import("../../components/local-editor/LocalEditor"), {
  ssr: false,
});

export default function LocalEditorPage() {
  return (
    <div className="flex flex-col h-[100vh]">
      <LocalEditor />
    </div>
  );
}
