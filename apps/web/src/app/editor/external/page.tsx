"use client";
import dynamic from "next/dynamic";

const ExternalEditor = dynamic(() => import("../../../components/external-editor/ExternalEditor"), {
  ssr: false,
});

export default function ExternalEditorPage(props: { searchParams: { manifest: string; preset?: string } }) {
  return <ExternalEditor manifest={props.searchParams.manifest} preset={props.searchParams.preset} />;
}
