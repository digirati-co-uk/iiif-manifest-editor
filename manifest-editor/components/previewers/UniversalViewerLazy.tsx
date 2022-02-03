import dynamic from "next/dynamic";

export const UniversalViewer = dynamic(() => import("./UniversalViewer"), {
  ssr: false
});
