import { BehaviorEditorConfiguration } from "@/_components/editors/BehaviorEditor/BehaviorEditor.types";
import { LocaleString } from "@/atoms/LocaleString";
import { InlineSelect } from "@/_components/form-elements/InlineSelect/InlineSelect";
import SelectSearch from "react-select-search";

export function filteredBehaviors(
  behaviors: string[],
  configs: BehaviorEditorConfiguration[]
): Array<{ value: string; hasConfig: false } | { value: string; hasConfig: true; configId: string }> {
  return behaviors.map((behavior) => {
    for (const config of configs) {
      const supported = { value: behavior, configId: config.id, hasConfig: true };
      if (config.type === "custom" && config.supports(behavior)) {
        return supported;
      }
      if (config.type === "choice" && config.items.find((i) => i.value === behavior)) {
        return supported;
      }
      if (config.type === "template" && behavior.match(config.regex)) {
        return supported;
      }
    }
    return { value: behavior, hasConfig: false };
  });
}

export function changeBehavior(allBehaviors: string[], oldValue: string, newValue: string): string[] {
  const foundIdx = allBehaviors.indexOf(oldValue);
  if (foundIdx === -1) {
    if (!newValue) {
      return allBehaviors;
    }

    return [...allBehaviors, newValue];
  }

  const toReturn = [...allBehaviors];
  if (newValue) {
    toReturn.splice(foundIdx, 1, newValue);
  } else {
    toReturn.splice(foundIdx, 1);
  }

  return toReturn;
}

export function RenderCustomBehaviorEditor(props: {
  config: BehaviorEditorConfiguration;
  behaviors: string[];
  setBehaviors: (b: string[]) => void;
}) {
  switch (props.config.type) {
    case "custom": {
      return <>{props.config.component(props.behaviors, props.setBehaviors)}</>;
    }

    case "choice": {
      const values = props.config.items.map((i) => i.value);
      const filtered = props.behaviors.filter((b) => !values.includes(b));
      const selected = props.behaviors.filter((b) => values.includes(b));
      const firstIndex = selected.length ? props.behaviors.findIndex((f) => f === selected[0]) : -1;

      const setNewChoice = (choice: string) => {
        if (firstIndex !== -1 && choice) {
          filtered.splice(firstIndex, 0, choice);
          props.setBehaviors(filtered);
        } else {
          props.setBehaviors(choice ? [...filtered, choice] : filtered);
        }
      };

      return <InlineSelect options={props.config.items} value={selected[0]} onChange={setNewChoice} />;
    }

    case "template": {
      return <div>... todo ...</div>;
    }
  }

  return <div />;
}
