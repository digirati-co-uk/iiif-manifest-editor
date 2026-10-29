import { EditorI18nScope } from "@manifest-editor/i18n";
import { BrowserI18nProvider, IIIFBrowser, type IIIFBrowserProps } from "iiif-browser";
import type { ReactNode } from "react";
import { ComponentI18nProvider } from "./ComponentI18nProvider";
import { useIIIFBrowserI18n } from "./IIIFBrowserI18n";

export function IIIFBrowserI18nProvider({ children }: { children: ReactNode }) {
  const i18n = useIIIFBrowserI18n();
  return (
    <ComponentI18nProvider>
      <EditorI18nScope>
        <BrowserI18nProvider i18n={i18n}>{children}</BrowserI18nProvider>
      </EditorI18nScope>
    </ComponentI18nProvider>
  );
}

export function LocalizedIIIFBrowser(props: IIIFBrowserProps) {
  const i18n = useIIIFBrowserI18n();
  return (
    <ComponentI18nProvider>
      <IIIFBrowser i18n={i18n} {...props} />
    </ComponentI18nProvider>
  );
}
