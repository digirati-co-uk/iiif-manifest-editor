import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
import Link from "next/link";
import { GlobalNav } from "../../components/site/GlobalNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="h-[64px]" />
      <div className="fixed left-0 right-0 top-0 h-[64px] bg-white z-50">
        <header className="h-[64px] flex w-full gap-12 px-4 items-center mx-auto max-w-screen-2xl border-b">
          <Link href="/" className="w-96 flex justify-start">
            <ManifestEditorLogo className="me-logo h-[27px] w-[206px]" />
          </Link>
          <div className="flex-1" />
          <div>
            <GlobalNav />
          </div>
          <div>
            <Link
              // Button
              className="bg-pink-500 hover:bg-pink-700 text-sm text-white py-2 px-4 rounded"
              href="/legacy"
            >
              Launch editor
            </Link>
          </div>
        </header>
      </div>
      <div className="mx-auto w-full max-w-screen-2xl min-h-[calc(100vh-64px)]">{children}</div>
      <div className="text-center p-2 text-sm text-slate-500 bg-slate-200">&copy; Digirati - IIIF Manifest Editor</div>
    </div>
  );
}
