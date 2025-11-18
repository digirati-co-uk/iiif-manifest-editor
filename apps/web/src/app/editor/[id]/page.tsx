"use client";
import dynamic from "next/dynamic";
import { use } from "react";

const BrowserEditor = dynamic(() => import("../../../components/browser-editor/AutomaticBrowserEditor"), {
  ssr: false,
});

export default function EditorPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);

  return <BrowserEditor id={params.id} />;
}
