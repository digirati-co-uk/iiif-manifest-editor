import { InputContainer, InputLabel } from "@/editors/Input";
import { ComposableInput } from "@/_components/form-elements/ComposableInput/ComposableInput";
import { RightArrow } from "@/icons/RightArrow";
import { AddIcon } from "@/icons/AddIcon";
import { AccordionContainer, AccordionItem, AccordionItemRef } from "@/components/layout/Accordion/Accordion";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { createRef, RefObject, useMemo, useState } from "react";
import { changeBehavior, filteredBehaviors, RenderCustomBehaviorEditor } from "./BehaviorEditor.utils";
import { LocaleString } from "@/atoms/LocaleString";
import { BehaviorEditorConfiguration } from "./BehaviorEditor.types";
import { Button } from "@/atoms/Button";
import { CloseIcon } from "@/icons/CloseIcon";

export interface BehaviorEditorProps {
  behavior: string[];
  onChange: (newValue: string[]) => void;
  configs: BehaviorEditorConfiguration[];
}

export function BehaviorEditor(props: BehaviorEditorProps) {
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
    <>
      {totalConfigs > 0 ? (
        <>
          <PaddedSidebarContainer>
            <InputLabel>Built-in behaviors</InputLabel>
          </PaddedSidebarContainer>
          <AccordionContainer>
            {Object.values(parsedConfig).map(({ ref, config }) => (
              <AccordionItem key={config.id} ref={ref} label={<LocaleString>{config.label}</LocaleString>}>
                <RenderCustomBehaviorEditor behaviors={props.behavior} setBehaviors={props.onChange} config={config} />
              </AccordionItem>
            ))}
          </AccordionContainer>
        </>
      ) : null}
      <PaddedSidebarContainer>
        <InputLabel>Behaviors</InputLabel>
        <InputContainer fluid>
          {filtered.map((t) =>
            t.hasConfig ? (
              <ComposableInput.Container
                key={t.value}
                $button
                onClick={() => {
                  const found = parsedConfig[t.configId];
                  if (found) {
                    found.ref.current?.open();
                    found.ref.current?.open();
                  }
                }}
              >
                <ComposableInput.ReadOnly>{t.value}</ComposableInput.ReadOnly>
                <div>
                  Edit <RightArrow />
                </div>
              </ComposableInput.Container>
            ) : (
              <ComposableInput.Container>
                <ComposableInput.Text
                  value={t.value}
                  onChange={(e) => changeBehaviorValue(t.value, e.currentTarget.value)}
                />
                <Button onClick={() => changeBehaviorValue(t.value, "")}>
                  <CloseIcon />
                </Button>
              </ComposableInput.Container>
            )
          )}
        </InputContainer>

        {showNew ? (
          <form
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
            <ComposableInput.Container>
              <ComposableInput.Text name="behavior" list="behaviors" />
            </ComposableInput.Container>
            <Button type="submit">Add new</Button>
          </form>
        ) : (
          <div onClick={() => setShowNew(true)}>
            <AddIcon /> Add new value
          </div>
        )}
      </PaddedSidebarContainer>
    </>
  );
}
