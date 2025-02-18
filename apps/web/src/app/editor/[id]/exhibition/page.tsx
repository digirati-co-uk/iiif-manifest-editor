import dynamic from "next/dynamic";

const ExhibitionEditor = dynamic(() => import("../../../../components/exhibition-editor/ExhibitionEditor"), {
  ssr: false,
});

export default function EditorPage({ params }: { params: { id: string } }) {
  return <ExhibitionEditor id={params.id} />;
}
