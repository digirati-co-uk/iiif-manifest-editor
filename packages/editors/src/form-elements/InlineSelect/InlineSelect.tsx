import { InternationalString } from "@iiif/presentation-3";
import { createRef, KeyboardEventHandler, useLayoutEffect, useMemo, useState } from "react";
import { InlineSelectStyles } from "./InlineSelect.styles";
import { LocaleString } from "react-iiif-vault";

export interface InlineSelectProps<T> {
  name?: string;
  id?: string;
  value?: T | null;
  onChange?: (value: T) => void;
  onDeselect?: () => void;
  options: Array<{ label: string | InternationalString; value: string }>;
}

export function InlineSelect<T extends string = string>(props: InlineSelectProps<T>) {
  const [currentValue, _setCurrentValue] = useState(props.value);
  const itemsLength = props.options.length;
  const elRefs = useMemo(() => props.options.map(() => createRef()), [props.options]) as any[];

  const setCurrentValue = (newValue: T) => {
    if (props.onChange) {
      props.onChange(newValue);
    }
    _setCurrentValue(newValue);
  };

  useLayoutEffect(() => {
    if (props.id) {
      const listener = () => {
        const idx = props.options.findIndex((b) => b.value === props.value);
        if (idx !== -1 && elRefs[idx].current) {
          elRefs[idx].current.focus();
        }
      };

      const $el = document.querySelector(`label[for="${props.id}"]`);
      if ($el) {
        $el.addEventListener("click", listener);
        return () => {
          $el.removeEventListener("click", listener);
        };
      }
    }
  }, [props.id]);

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
    const currentEl = document.activeElement;
    const currentIndex = elRefs.findIndex((r) => r.current === currentEl);
    if (currentIndex === -1) {
      return;
    }

    switch (e.code) {
      case "ArrowRight":
      case "ArrowDown": {
        if (currentIndex !== itemsLength - 1) {
          const next = currentIndex + 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
      // Focus previous
      case "ArrowLeft":
      case "ArrowUp": {
        if (currentIndex !== 0) {
          const next = currentIndex - 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
    }
  };

  return (
    <InlineSelectStyles.Container data-vertical={props.options.length > 3}>
      {props.options.map((option, idx) => {
        return (
          <InlineSelectStyles.Item
            key={option.value}
            data-active={option.value === currentValue}
            ref={elRefs[idx]}
            id={option.value === currentValue ? props.id : undefined}
            onKeyDown={onKeyDown}
            onClick={() => {
              if (option.value === currentValue && props.onDeselect) {
                props.onDeselect();
                setCurrentValue("" as any);
              } else {
                setCurrentValue(option.value as any);
              }
            }}
          >
            <LocaleString>{option.label}</LocaleString>
          </InlineSelectStyles.Item>
        );
      })}

      {props.name ? <input type="hidden" name={props.name} value={currentValue || undefined} /> : null}
    </InlineSelectStyles.Container>
  );
}
