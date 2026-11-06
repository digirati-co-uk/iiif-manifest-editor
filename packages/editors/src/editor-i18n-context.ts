import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useOptionalEditorI18nInstance } from "@manifest-editor/i18n";
import { createEditorI18n, type EditorI18n } from "@manifest-editor/i18n/core";

/** Runtime carrier for react-iiif-vault's bridge into Atlas's non-DOM renderer. */
export const EditorI18nBridgeContext = createContext<EditorI18n | undefined>(undefined);

/** Never wraps a native Atlas scene in the DOM element rendered by the public provider. */
export function useEditorsI18nInstance() {
  const inherited = useOptionalEditorI18nInstance();
  const bridged = useContext(EditorI18nBridgeContext);
  const [standalone] = useState(() => (inherited || bridged ? undefined : createEditorI18n()));
  return inherited || bridged || standalone!;
}

export function useEditorsTranslations(namespace: string) {
  const runtime = useEditorsI18nInstance();
  useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  return useMemo(() => runtime.translate(namespace), [runtime, namespace]);
}
