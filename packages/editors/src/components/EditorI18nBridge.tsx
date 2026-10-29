import { EditorI18nProvider, useOptionalEditorI18nInstance, type EditorI18n } from "@manifest-editor/i18n";
import { HTMLPortal } from "@atlas-viewer/atlas";
import { forwardRef, useContext, type ComponentProps, type ReactNode } from "react";

import { EditorI18nBridgeContext } from "../editor-i18n-context";
export { EditorI18nBridgeContext } from "../editor-i18n-context";

export function EditorI18nBoundary({ instance, children }: { instance?: EditorI18n; children: ReactNode }) {
  const inherited = useOptionalEditorI18nInstance();
  const bridged = useContext(EditorI18nBridgeContext);
  const runtime = instance || bridged;
  // An existing provider also owns controlled selection callbacks; retain it intact.
  if (inherited || !runtime) return <>{children}</>;
  return <EditorI18nProvider instance={runtime}>{children}</EditorI18nProvider>;
}

/** Atlas HTMLPortal creates a separate DOM root, so capture the actual instance before crossing it. */
export const EditorHTMLPortal = forwardRef<React.ComponentRef<typeof HTMLPortal>, ComponentProps<typeof HTMLPortal>>(
  ({ children, ...props }, ref) => {
    const inherited = useOptionalEditorI18nInstance();
    const bridged = useContext(EditorI18nBridgeContext);
    return (
      <HTMLPortal {...props} ref={ref}>
        <EditorI18nBoundary instance={inherited || bridged}>{children}</EditorI18nBoundary>
      </HTMLPortal>
    );
  }
);
