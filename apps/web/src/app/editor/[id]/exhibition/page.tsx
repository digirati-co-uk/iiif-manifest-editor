"use client";
import dynamic from "next/dynamic";
import { use } from "react";

const ExhibitionEditor = dynamic(() => import("../../../../components/exhibition-editor/ExhibitionEditor"), {
  ssr: false,
});

export default function EditorPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return <ExhibitionEditor id={params.id} />;
}
