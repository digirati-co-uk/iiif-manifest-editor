import { Config } from "@manifest-editor/shell";
import dynamic from "next/dynamic";

const BrowserEditor = dynamic(() => import("../../../../components/browser-editor/BrowserEditor"), {
  ssr: false,
});

const compatConfig: Partial<Config> = {
  editorConfig: {
    Manifest: {
      // singleTab: "@manifest-editor/overview",
      onlyTabs: [
        //
        "@manifest-editor/overview",
        "@manifest-editor/metadata",
      ],
      fields: ["label", "summary", "metadata", "rights", "requiredStatement", "rendering"],
    },
    Canvas: {
      singleTab: "@manifest-editor/overview",
      fields: ["items", "label", "metadata", "annotations"],
    },
  },
};

export default function EditorPage({ params }: { params: { id: string } }) {
  return <BrowserEditor id={params.id} config={compatConfig} />;
}
