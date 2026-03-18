"use client";
import dynamic from "next/dynamic";
import { use } from "react";

const UniversalViewerEditor = dynamic(
  () => import("../../../../components/universal-viewer-editor/UniversalViewerEditor"),
  {
    ssr: false,
  },
);

export default function EditorPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);

  return <UniversalViewerEditor id={params.id} />;
}
