import { IIIFExplorerProps } from "../IIIFExplorer";
import { ResourceActionBar } from "./ResourceActionBar";
import { targets } from "../targets";
import { useMemo } from "react";
import { useStore } from "zustand";
import { useExplorerStore } from "../IIIFExplorer.store";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { OutputFormat, OutputType } from "../IIIFExplorer.types";
import { formats } from "../formats";
import invariant from "tiny-invariant";
import { ComboButton } from "./ComboButton";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ResourceActionBar.styles";
import { LocaleString } from "../../../../atoms/LocaleString";
import { Reference } from "@iiif/presentation-3";

interface ExplorerOutputProps {
  /**
   * Resource types valid for output. (e.g. Manifest, Canvas)
   */
  types: OutputType[];
  /**
   * Targets of the output. (e.g. clipboard, input)
   *   - first is default.
   */
  targets: IIIFExplorerProps["outputTargets"];
  format: OutputFormat;
  output?: { id: string; type: string };
  onSelect?: () => void;
}

export function useValidTargets(types: OutputType[]) {
  const store = useExplorerStore();
  const vault = useVault();
  const history = useStore(store, (s) => s.history);

  return useVaultSelector(() => {
    const validMap: Partial<{ [K in OutputType]: { id: string; type: string; parent?: Reference | null } }> = {};
    let hasValidItem = false;
    let mostSpecificTarget = null;
    // List of ids.
    for (let i = 0; i < history.length; i++) {
      const resource = history[i];
      const parent = i === 0 ? null : history[i - 1];
      const id = resource.id;
      const fullItem = vault.get<any>(resource);
      if (fullItem && fullItem.type && types.includes(fullItem.type)) {
        hasValidItem = true;
        validMap[fullItem.type as OutputType] = { ...resource, parent };
        mostSpecificTarget = fullItem.type as OutputType;
      }
    }

    return [validMap, hasValidItem, mostSpecificTarget] as const;
  }, [history]);
}

export function ExplorerOutput(props: ExplorerOutputProps) {
  // @todo
  //   - Get the current valid target from the config + context
  //   - Add list of buttons + callbacks to pass to action bar
  //   - formats..
  const vault = useVault();
  const selectedFormat = formats[props.format.type];

  const validFormats = useMemo(() => {
    const valid: OutputType[] = [];
    for (const type of props.types) {
      if (selectedFormat.supportedTypes.includes(type)) {
        valid.push(type);
      }
    }
    return valid;
  }, [props.types, selectedFormat.supportedTypes]);

  const [valid, hasValid, mostSpecific] = useValidTargets(validFormats);
  const output = mostSpecific ? vault.get<any>(valid[mostSpecific]) : undefined;

  // Configured actions.
  const actions = useMemo(
    () =>
      (props.targets || []).map((type) => {
        const template = targets[type.type];
        return {
          label: type.label || template.label,
          action: async () => {
            if (mostSpecific) {
              const ref = valid[mostSpecific];
              if (!ref) {
                // This should not happen.
                return;
              }
              const resource = vault.toPresentation3({ id: ref.id, type: ref.type as any });
              const format = type.format || props.format;
              const chosenFormat = type.format && formats[format.type] ? formats[format.type] : selectedFormat;
              const parent = ref.parent;
              const formatted = await chosenFormat.format(resource, format as never, parent);
              await template.action(formatted, type as any);
              if (props.onSelect) {
                props.onSelect();
              }
            }
          },
        };
      }),
    [mostSpecific, props.format, props.targets, selectedFormat, valid, vault]
  );

  invariant(selectedFormat, "Invalid format selected");

  return (
    <div className={$.ResourceActionBarContainer}>
      <div className={$.ResourceActionMeta}>
        {hasValid && output ? (
          <>
            <div className={$.ResourceActionDescription}>
              {output.label ? <LocaleString>{output.label}</LocaleString> : output.type}
            </div>
            <a href="#" className={$.ResourceActionLabel}>
              {output.id}
            </a>
          </>
        ) : null}
      </div>
      <div className={$.ResourceActions}>
        <ComboButton actions={actions} disabled={!hasValid} />
      </div>
    </div>
  );
}
