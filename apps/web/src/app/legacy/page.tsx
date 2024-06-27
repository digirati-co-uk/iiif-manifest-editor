import dynamic from "next/dynamic";

const LegacyManifestEditor = dynamic(() => import("../../components/LegacyManifestEditor/LegacyManifestEditor"), {
  ssr: false,
});

export default function LegacyPage() {
  return <LegacyManifestEditor />;
}
