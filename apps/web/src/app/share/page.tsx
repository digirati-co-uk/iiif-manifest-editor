"use client";
import { ManifestEditorLogo } from "@manifest-editor/components";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GlobalNav } from "../../components/site/GlobalNav";

const SharePage = dynamic(() => import("../../components/share/SharePage"), {
  ssr: false,
});

export default function Share() {
  return (
    <div className="flex flex-col h-[100vh]">
      <header className="h-[64px] flex w-full gap-12 px-4 items-center border-b sh">
        <Link href="/" className="w-96 flex justify-start">
          <ManifestEditorLogo className="me-logo h-[27px] w-[206px]" />
        </Link>
        <div className="flex-1" />
        <div>
          <GlobalNav />
        </div>
      </header>

      <div className="flex flex-col flex-1">
        <div className="w-full flex flex-1 max-w-full min-w-0">
          <SharePage />
        </div>
      </div>
    </div>
  );
}
