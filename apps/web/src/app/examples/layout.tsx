import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
import Link from "next/link";
import { GlobalNav } from "../../components/site/GlobalNav";

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[100vh]">
      <header className="h-[64px] flex w-full gap-12 px-4 items-center border-b">
        <Link href="/" className="w-96 flex justify-start">
          <ManifestEditorLogo className="me-logo h-[27px] w-[206px]" />
        </Link>
        <div className="flex-1" />
        <div>
          <GlobalNav />
        </div>
      </header>

      {children}
    </div>
  );
}
