import { IIIFExplorerProps } from "../IIIFExplorer";
import { targets } from "../targets";
import { useMemo } from "react";
import { useStore } from "zustand";
import { useExplorerStore } from "../IIIFExplorer.store";
import { LocaleString, useVault, useVaultSelector } from "react-iiif-vault";
import { HistoryItem, OutputFormat, OutputType } from "../IIIFExplorer.types";
import { formats } from "../formats";
import invariant from "tiny-invariant";
import { ComboButton } from "./ComboButton";
import $ from "../styles/ResourceActionBar.module.css";
import { getOutputType } from "../IIIFExplorer.utils";

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
  const selected = useStore(store, (s) => s.selected);

  return useVaultSelector(() => {
    const validMap: Partial<{ [K in OutputType]: { id: string; type: string; parent?: HistoryItem | null } }> = {};
    let hasValidItem = false;
    let mostSpecificTarget = null;
    // List of ids.
    for (let i = 0; i < history.length; i++) {
      const resource: any = history[i]?.id === selected?.id ? selected : history[i];
      const parent = i === 0 ? null : history[i - 1];
      const fullItem = vault.get(resource);
      const historyType = getOutputType(resource);
      if (fullItem && fullItem.type && types.includes(historyType)) {
        hasValidItem = true;
        validMap[historyType] = { ...resource, parent };
        mostSpecificTarget = historyType;
      }
    }
    return [validMap, hasValidItem, mostSpecificTarget] as const;
  }, [history, selected]);
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
  const output = mostSpecific ? vault.get<any>(valid[mostSpecific] as any) : undefined;

  // Configured actions.
  const actions = useMemo(
    () =>
      (props.targets || [])
        .map((type) => {
          const template = targets[type.type];
          if (type.supportedTypes) {
            if (mostSpecific && !type.supportedTypes.includes(mostSpecific)) {
              return null;
            }
          }
          return {
            label: type.label || template.label,
            action: async () => {
              if (mostSpecific) {
                const ref = valid[mostSpecific];
                if (!ref) {
                  // This should not happen.
                  return;
                }
                const format = type.format || props.format;
                const chosenFormat = type.format && formats[format.type] ? formats[format.type] : selectedFormat;
                const formatted = await chosenFormat.format(ref, format as never, vault);
                await template.action(formatted, ref as any, type as any, vault);
                if (props.onSelect) {
                  props.onSelect();
                }
              }
            },
          };
        })
        .filter((t) => t !== null) as Array<{ label: string; action: () => Promise<void> }>,
    [mostSpecific, props, selectedFormat, valid, vault]
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
            <a href={output.id} target="_blank" className={$.ResourceActionLabel}>
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
