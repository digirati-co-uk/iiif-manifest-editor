import { ManifestEditorLogo } from "@manifest-editor/components";
import Link from "next/link";
import { GlobalNav } from "../../components/site/GlobalNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="h-[64px]" />
      <div className="fixed left-0 right-0 top-0 h-[64px] bg-white z-50">
        {/* mx-auto max-w-screen-2xl */}
        <header className="h-[64px] flex w-full gap-[clamp(0.5rem,3.75vw,3rem)] px-[clamp(0.5rem,1.25vw,1rem)] items-center border-b shadow">
          <Link href="/" aria-label="Manifest Editor home" className="flex flex-none justify-start">
            <ManifestEditorLogo
              aria-hidden="true"
              className="me-logo h-auto w-[clamp(8rem,13.75vw,11rem)]"
            />
          </Link>
          <div className="flex-1" />
          <div>
            <GlobalNav />
          </div>
        </header>
      </div>
      {/* mx-auto w-full max-w-screen-2xl */}
      <main className="w-full min-h-[calc(100vh-64px)]">{children}</main>
      <footer className="text-center p-2 text-sm text-slate-600 bg-slate-200">
        &copy; Digirati - IIIF Manifest Editor
      </footer>
    </div>
  );
}
