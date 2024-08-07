import { ManifestEditorLogo } from "@manifest-editor/components";
import Link from "next/link";
import { GlobalNav } from "../../components/site/GlobalNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="h-[64px]" />
      <div className="fixed left-0 right-0 top-0 h-[64px] bg-white z-50">
        {/* mx-auto max-w-screen-2xl */}
        <header className="h-[64px] flex w-full gap-12 px-4 items-center border-b shadow">
          <Link href="/" className="w-96 flex justify-start">
            <ManifestEditorLogo />
          </Link>
          <div className="flex-1" />
          <div>
            <GlobalNav />
          </div>
        </header>
      </div>
      {/* mx-auto w-full max-w-screen-2xl */}
      <div className="w-full min-h-[calc(100vh-64px)]">{children}</div>
      <div className="text-center p-2 text-sm text-slate-500 bg-slate-200">&copy; Digirati - IIIF Manifest Editor</div>
    </div>
  );
}
