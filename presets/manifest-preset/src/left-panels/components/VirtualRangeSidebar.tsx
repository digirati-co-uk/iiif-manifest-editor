import { useTranslations } from "@manifest-editor/i18n";
import type { RangeTableOfContentsNode } from "@iiif/helpers";
import { moveEntities } from "@iiif/helpers/vault/actions";
import { ActionButton, DeleteForeverIcon, InfoMessage, WarningMessage } from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInlineCreator, useManifestEditor } from "@manifest-editor/shell";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { useCallback } from "react";
import { LocaleString, useVault } from "react-iiif-vault";
import { MergeDownIcon } from "../../center-panels/components/RangeWorkbenchSection";

export function VirtualRangeSidebar({
  range,
  setSelectedTopLevelRange,
}: {
  range: RangeTableOfContentsNode;
  setSelectedTopLevelRange: (range: { id: string; type: "Range" }) => void;
}) {
  const t = useTranslations("manifest");
  const manifest = useManifestEditor();
  const vault = useVault();
  const creator = useInlineCreator();

  const combineVirtualRanges = useCallback(async () => {
    const rangeEditor = new EditorInstance({
      reference: { id: range.id, type: "Range" },
      vault,
    });
    const items = range.items || [];

    // Create sub range.
    const createdRange = (await creator.create(
      "@manifest-editor/range-top-level",
      {
        type: "Range",
        label: { en: ["Range 1"] },
        items: [],
      },
      {
        parent: {
          property: "structures",
          resource: { id: manifest.technical.id.getWithoutTracking(), type: "Manifest" },
          atIndex: 0,
        },
      }
    )) as { id: string; type: "Range" };

    vault.dispatch(
      moveEntities({
        subjects: {
          type: "slice",
          startIndex: 1,
          length: items.length,
        },
        from: {
          id: manifest.technical.id.getWithoutTracking(),
          type: "Manifest",
          key: "structures",
        },
        to: {
          id: createdRange.id,
          type: "Range",
          key: "items",
        },
      })
    );
  }, []);

  const deleteVirtualRanges = useCallback(() => {
    manifest.structural.ranges.empty();
  }, []);

  return (
    <div>
      <InfoMessage className="mb-2 leading-tight text-sm">{t("workflow.multipleRangesHelp")}</InfoMessage>

      <h3 className="mb-2 text-black/40">{t("workflow.chooseAnOption")}</h3>
      <ul className="mb-4">
        <li className="px-2 py-1">
          <ActionButton onClick={combineVirtualRanges}>
            <PlusIcon />
            {t("workflow.combineIntoSingleRange")}
          </ActionButton>
        </li>
        <li className="px-2 py-1">
          <ActionButton onClick={deleteVirtualRanges}>
            <DeleteForeverIcon />
            {t("workflow.deleteRangesAndStartAgain")}
          </ActionButton>
        </li>
      </ul>

      <h3 className="mb-2 text-black/40">{t("workflow.chooseARangeToEdit")}</h3>
      <ul>
        {(range.items || []).map((item) => (
          <li key={item.id} className="mb-1 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1">
            <button
              onClick={() =>
                setSelectedTopLevelRange({
                  id: item.id,
                  type: "Range",
                })
              }
            >
              <LocaleString>{item.label}</LocaleString>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
