"use client";
import dynamic from "next/dynamic";
import { use } from "react";

const ExternalEditor = dynamic(() => import("../../../components/external-editor/ExternalEditor"), {
  ssr: false,
});

export default function ExternalEditorPage(props: { searchParams: Promise<{ manifest: string; preset?: string }> }) {
  const searchParams = use(props.searchParams);
  return <ExternalEditor manifest={searchParams.manifest} preset={searchParams.preset} />;
}
