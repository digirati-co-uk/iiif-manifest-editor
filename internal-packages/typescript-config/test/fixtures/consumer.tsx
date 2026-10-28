import {
  EditorI18nProvider,
  EditorI18nScope,
  EditorTrans,
  useEditorI18n,
  useOptionalEditorI18nInstance,
  useTranslations,
  type EditorI18nProviderProps,
  type MessageReference,
} from "@manifest-editor/i18n";
import { createEditorI18n, createMessageReference, type EditorI18n } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";

const instance: EditorI18n = createEditorI18n({ catalogs: dutchCatalogs, profiles: { plain: dutchPlain } });
const reference: MessageReference = createMessageReference("external-plugin", "count", {
  values: { count: 2, title: "Authored title", enabled: true, empty: null },
});
const props: EditorI18nProviderProps = { instance, locale: "nl", onLocaleChange: (locale) => void locale };

export function Consumer() {
  const inherited: EditorI18n | undefined = useOptionalEditorI18nInstance();
  const { resolveMessage, setLocale, coverage } = useEditorI18n();
  const t = useTranslations("external-plugin");
  const label: string = t("open.key", { count: 2 }, { defaultValue: "Fallback" });
  const pending: Promise<void> = setLocale("nl");
  void pending;
  void coverage.complete;
  void inherited;
  return (
    <EditorI18nProvider {...props}>
      <EditorI18nScope>
        <button>{resolveMessage(reference, label)}</button>
        <EditorTrans reference={reference} components={{ link: <a href="https://example.org/help">Help</a> }} />
      </EditorI18nScope>
    </EditorI18nProvider>
  );
}

// Keep the transport contract primitive; authored language maps and React nodes are not values.
// @ts-expect-error Nested authored IIIF data is not interpolation data.
createMessageReference("external-plugin", "key", { values: { label: { cy: ["Teitl"] } } });
// @ts-expect-error Rich interpolation is primitive text, not an executable/renderable value.
createMessageReference("external-plugin", "key", { values: { child: <span /> } });
