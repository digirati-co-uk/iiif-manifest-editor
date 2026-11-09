import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { ControlButton, OpaqueControls } from "@manifest-editor/components";
import { useConfig, useDecayState } from "@manifest-editor/shell";
import { SmallButton } from "@manifest-editor/ui/atoms/Button";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { LanguageIcon } from "@manifest-editor/ui/icons/LanguageIcon";
import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { type UseMetadataEditor, useMetadataEditor } from "../../hooks/useMetadataEditor";
import { InputGroup, InputLabel } from "../Input";
import { RichTextLanguageField } from "../RichTextLanguageField/RichTextLanguageField";
import { contentLanguageName } from "../../i18n";
import { EmptyLanguageField } from "./LanguageFieldEditor.styles";

export interface LanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
  labelMessage?: MessageReference;
  index?: number;
  className?: string;
  containerId?: string;
  autoFocus?: boolean;
  property?: "label" | "value";
  focusId?: string;
  guidanceReference?: string;
  disableMultiline?: boolean;
  singleValue?: boolean;
  /** Defaults to plain text. Set false for summary, metadata values and required-statement values. */
  disallowHTML?: boolean;
}

export function LanguageFieldEditor(props: LanguageFieldEditorProps) {
  const { resolveMessage } = useEditorI18n();
  return (
    <LanguageFieldEditorFields
      key={props.focusId || props.containerId}
      {...props}
      label={props.labelMessage ? resolveMessage(props.labelMessage, props.label) : props.label}
    />
  );
}

function LanguageFieldEditorFields(props: LanguageFieldEditorProps) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const { locale } = useEditorI18n();
  const {
    // This hook does the heavily lifting on the data side.
    firstItem,
    createNewItem,
    fieldKeys,
    changeValue,
    getFieldByKey,
    changeLanguage,
    saveChanges,
    removeItem,
  } = useMetadataEditor(props);
  const [active, activeState] = useDecayState(2000);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const {
    i18n: { advancedLanguageMode, availableLanguages },
  } = useConfig();

  const isFullMode = advancedLanguageMode || fieldKeys.length > 1;

  // We can set these up from config, or the browser or just allow them to be passed down.
  // This is where we choose a default for which languages will appear in the dropdown.
  // The `firstItem` will be based on the i18n of the user's browser.
  // ...
  const id = useMemo(() => `k-${Date.now()}`, []);

  const focusId = props.focusId ? props.focusId : id + props.metadataKey;
  const allFields = firstItem ? (
    <>
      {fieldKeys.length > 0 && (
        <div
          style={{
            // border: "1px solid lightgrey",
            display: "flex",
            flexDirection: "column",
            borderRadius: "5px",
            width: "100%",
            gap: "0.25em",
            marginBottom: "0.5em",
          }}
        >
          {fieldKeys.map((key, n) => {
            const field = getFieldByKey(key)!;

            // We can avoid rendering the `firstItem` twice here.
            // This may not be desired in a popup (as in current madoc)
            // if (key === firstItem.id) {
            //   return null;
            // }

            const languages = [...availableLanguages];
            // Even if we don't have the language in the `availableLanguages` we
            // need to have the current language in the dropdown.
            if (availableLanguages.indexOf(field.language) === -1) {
              languages.push(field.language);
            }
            // We can also push on any fallbacks we might want always to be
            // available.
            if (availableLanguages.indexOf("none") === -1) {
              languages.unshift("none");
            }

            return (
              <InputGroup
                key={key}
                $active={fieldKeys.length > 1}
                onMouseEnter={() => activeState.set()}
                onMouseLeave={() => activeState.clear(true)}
              >
                <RichTextLanguageField
                  ariaLabel={t("messages.fieldLabel", {
                    label: props.label,
                    language: contentLanguageName(field.language, locale, t("language.none")),
                  })}
                  autoFocus={n === 0 ? props.autoFocus : undefined}
                  disableMultiline={props.disableMultiline}
                  disallowHTML={props.disallowHTML ?? true}
                  id={n === 0 ? focusId : undefined}
                  language={field.language}
                  value={field.value}
                  languages={languages}
                  onFocus={() => {
                    activeState.set();
                  }}
                  onBlur={() => {
                    activeState.clear();
                    saveChanges(props.index, props.property);
                  }}
                  onUpdateLanguage={(lang) => {
                    changeLanguage(key, lang);
                    saveChanges(props.index, props.property);
                  }}
                  onUpdate={(value) => {
                    changeValue(key, value);
                    saveChanges(props.index, props.property);
                  }}
                />
                {isReorderMode && fieldKeys.length > 0 ? (
                  <SmallButton
                    style={{ visibility: active ? "visible" : "hidden" }}
                    className="remove"
                    aria-label={commonT("actions.remove")}
                    onClick={() => {
                      removeItem(key);
                      saveChanges(props.index, props.property);
                    }}
                    title={commonT("actions.delete")}
                  >
                    <CloseIcon />
                  </SmallButton>
                ) : null}
              </InputGroup>
            );
          })}
        </div>
      )}

      {isFullMode && (!props.singleValue || fieldKeys.length > 1) ? (
        <OpaqueControls active={active}>
          {/* Here we can call createNewItem() with true, to indicate a new on existing */}
          <ControlButton aria-label={commonT("actions.create")} onClick={() => createNewItem(true)}>
            {t("ui.addAnother")}
          </ControlButton>

          <ControlButton aria-label={commonT("actions.remove")} onClick={() => setIsReorderMode((o) => !o)}>
            {commonT("actions.remove")}
          </ControlButton>
        </OpaqueControls>
      ) : null}
    </>
  ) : null;

  return (
    <div className={props.className || "mb-4"} id={props.containerId}>
      <>
        <InputLabel htmlFor={focusId}>{props.label}</InputLabel>
      </>
      {firstItem ? (
        allFields
      ) : (
        <>
          <EmptyLanguageField
            id={focusId}
            onClick={() => {
              flushSync(() => {
                createNewItem(false);
              });
              document.getElementById(focusId)?.focus();
            }}
          >
            <span>{t("ui.addValue")}</span>
            <LanguageIcon aria-hidden />
          </EmptyLanguageField>
        </>
      )}
    </div>
  );
}
