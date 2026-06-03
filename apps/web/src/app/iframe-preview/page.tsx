"use client";

import dynamic from "next/dynamic";

const IframePreviewRoute = dynamic(
  () => import("../../components/iframe-preview/IframePreviewRoute"),
  {
    ssr: false,
  },
);

export default function Page() {
  return <IframePreviewRoute />;
}
