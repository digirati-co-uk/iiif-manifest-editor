import { GlobalNav } from "../../../components/site/GlobalNav";
import { HeaderLanguageSwitcher } from "../../../components/site/HeaderLanguageSwitcher";
import { SiteLogoLink } from "../../../components/site/SiteLogoLink";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="h-24 md:h-16" />
      <div className="fixed left-0 right-0 top-0 h-24 md:h-16 bg-white z-50">
        {/* mx-auto max-w-screen-2xl */}
        <header className="grid h-24 w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[56px_40px] items-center gap-x-3 border-b px-[clamp(0.5rem,1.25vw,1rem)] shadow md:flex md:h-16 md:gap-[clamp(0.5rem,3.75vw,3rem)]">
          <SiteLogoLink />
          <div className="hidden md:block md:flex-1" />
          <div className="col-span-2 row-start-2 justify-self-end md:order-none">
            <GlobalNav />
          </div>
          <div className="col-start-2 row-start-1 justify-self-end">
            <HeaderLanguageSwitcher />
          </div>
        </header>
      </div>
      {/* mx-auto w-full max-w-screen-2xl */}
      <main className="w-full min-h-[calc(100vh-96px)] md:min-h-[calc(100vh-64px)]">{children}</main>
      <footer className="text-center p-2 text-sm text-slate-600 bg-slate-200">
        &copy; Digirati - IIIF Manifest Editor
      </footer>
    </div>
  );
}
