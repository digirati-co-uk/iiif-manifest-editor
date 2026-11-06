import { useEditorI18n } from "@manifest-editor/i18n";
import type { ReactNode } from "react";
import { I18nProvider } from "react-aria";

/** Keep React Aria's built-in instructions/collation on the UI locale, independently of IIIF content. */
export function ComponentI18nProvider({ children }: { children: ReactNode }) {
  const { locale } = useEditorI18n();
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
