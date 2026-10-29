import { useDisplayLabel } from "../../i18n";
import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import { AccordionContainer, AccordionItem, type AccordionItemRef } from "@manifest-editor/ui/atoms/Accordion";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { AddIcon } from "@manifest-editor/ui/icons/AddIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { RightArrow } from "@manifest-editor/ui/icons/RightArrow";
import { createRef, type RefObject, useMemo, useState } from "react";
import { LocaleString } from "react-iiif-vault";
import { ComposableInput } from "../../form-elements/ComposableInput/ComposableInput";
import { InputContainer, InputLabel } from "../Input";
import type { BehaviorEditorConfiguration } from "./BehaviorEditor.types";
import { changeBehavior, filteredBehaviors, RenderCustomBehaviorEditor } from "./BehaviorEditor.utils";

export interface BehaviorEditorProps {
  id?: string;
  behavior: string[];
  onChange: (newValue: string[]) => void;
  configs: BehaviorEditorConfiguration[];
}

export function BehaviorEditor(props: BehaviorEditorProps) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  const [showNew, setShowNew] = useState(false);

  const [parsedConfig, totalConfigs] = useMemo(() => {
    const ret: Record<string, { ref: RefObject<AccordionItemRef>; config: BehaviorEditorConfiguration }> = {};

    for (const config of props.configs) {
      ret[config.id] = { ref: createRef(), config };
    }

    return [ret, Object.keys(ret).length] as const;
  }, [props.configs]);

  const filtered = filteredBehaviors(props.behavior, props.configs);

  const changeBehaviorValue = (oldValue: string, newValue: string) => {
    props.onChange(changeBehavior(props.behavior, oldValue, newValue));
  };

  return (
    <div id={props.id}>
      {totalConfigs > 0 ? (
        <>
          <PaddedSidebarContainer>
            <InputLabel>{t("ui.builtinBehaviors")}</InputLabel>
          </PaddedSidebarContainer>
          <AccordionContainer>
            {Object.values(parsedConfig).map(({ ref, config }) => (
              <AccordionItem
                key={config.id}
                initialOpen={config.initialOpen}
                ref={ref}
                label={<LocaleString>{apiLabel(config) ?? config.label}</LocaleString>}
              >
                <RenderCustomBehaviorEditor behaviors={props.behavior} setBehaviors={props.onChange} config={config} />
              </AccordionItem>
            ))}
          </AccordionContainer>
        </>
      ) : null}
      <PaddedSidebarContainer>
        <InputLabel>{t("ui.behaviors")}</InputLabel>
        <InputContainer $fluid key={filtered.length}>
          {filtered.map((entry, k) =>
            entry.hasConfig ? (
              <ComposableInput.Container
                key={entry.value}
                $button
                onClick={() => {
                  const found = parsedConfig[entry.configId];
                  if (found) {
                    found.ref.current?.open();
                    found.ref.current?.open();
                  }
                }}
              >
                <ComposableInput.ReadOnly>{entry.value}</ComposableInput.ReadOnly>
                <div style={{ display: "flex", alignItems: "center", color: "#666" }}>
                  {commonT("actions.edit")}
                  <RightArrow style={{ margin: "0 0.4em", width: "1.2em" }} />
                </div>
              </ComposableInput.Container>
            ) : (
              <ComposableInput.Container key={k}>
                <ComposableInput.Text
                  aria-label={t("messages.customBehavior", { number: k + 1 })}
                  value={entry.value}
                  onChange={(e) => changeBehaviorValue(entry.value, e.currentTarget.value)}
                />
                <Button
                  aria-label={t("messages.removeBehavior", { value: entry.value })}
                  onClick={() => changeBehaviorValue(entry.value, "")}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </ComposableInput.Container>
            )
          )}
        </InputContainer>

        {showNew ? (
          <form
            className="flex flex-col gap-2 border-2 border-gray-100 p-2 rounded-md"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.target as HTMLFormElement);
              const formData = Object.fromEntries(data.entries()) as any;
              if (formData.behavior) {
                setShowNew(false);
                // replace t.value => with new value. OR create new value OR remove value
                props.onChange([...props.behavior, formData.behavior]);
              }
            }}
          >
            <InputLabel htmlFor="custom_behavior">{t("ui.addCustomBehavior")}</InputLabel>
            <ComposableInput.Container>
              <ComposableInput.Text name="behavior" id="custom_behavior" list="behaviors" autoFocus />
            </ComposableInput.Container>
            <ActionButton center primary type="submit">
              <AddIcon /> {commonT("actions.add")}
            </ActionButton>
          </form>
        ) : (
          <ActionButton onPress={() => setShowNew(true)}>
            <AddIcon /> {t("ui.addCustomBehavior")}
          </ActionButton>
        )}
      </PaddedSidebarContainer>
    </div>
  );
}
