import { ActionButton, AddIcon, CheckIcon, Modal } from "@manifest-editor/components";
import { useAnnotationPageEditor, useConfig, useCreator } from "@manifest-editor/shell";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { useEffect, useMemo, useState } from "react";
import { AnnotationContext, useResourceContext, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { useToggleList } from "../../helpers";
import {
  combinePaintingAnnotationsIntoChoice,
  getPaintingChoiceCandidates,
  type PaintingChoiceCandidate,
} from "../../helpers/choice-painting-annotations";
import { createAppActions } from "../../helpers/create-app-actions";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";
import { AnnotationList } from "../AnnotationList/AnnotationList";
import { InputLabel, InputLabelEdit } from "../Input";

export function PaintingAnnotationList({ onCreate, createFilter }: { onCreate?: () => void; createFilter?: string }) {
  const { annotationPage, canvas } = useResourceContext();
  const { structural, notAllowed } = useAnnotationPageEditor();
  const { items } = structural;
  const [toggled, toggle] = useToggleList();
  const [combineModalOpen, setCombineModalOpen] = useState(false);

  invariant(annotationPage, "Annotation page not found");

  const [canCreateAnnotation, annotationActions] = useCreator(
    { id: annotationPage, type: "AnnotationPage" },
    "items",
    "Annotation",
    canvas ? { id: canvas, type: "Canvas" } : undefined,
    { isPainting: true },
  );

  const vault = useVault();
  const annotationRefs = items.get() || [];
  const candidates = useMemo(() => getPaintingChoiceCandidates(vault, annotationRefs), [vault, annotationRefs]);
  const canCombine = candidates.filter((candidate) => candidate.eligible).length >= 2;

  return (
    <>
      {!notAllowed.includes("items") ? (
        <div className="mb-2" id={items.containerId()}>
          <div className="flex flex-col gap-2 mb-2">
            {!items.get()?.length ? (
              <>
                <InputLabel>Media</InputLabel>
              </>
            ) : (
              <InputLabel>
                Media
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <AnnotationList
              id={items.focusId()}
              list={items.get()}
              isMedia
              canvasId={canvas}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => annotationActions.edit(item, idx)}
              createActions={createAppActions(items)}
            />
          </div>
          {canCreateAnnotation ? (
            <div className="flex flex-wrap gap-2">
              <ActionButton
                onPress={
                  onCreate
                    ? onCreate
                    : () => {
                        if (createFilter) {
                          annotationActions.createFiltered(createFilter);
                        } else {
                          annotationActions.create();
                        }
                      }
                }
              >
                <AddIcon /> Add media
              </ActionButton>
              {canCombine ? (
                <ActionButton onPress={() => setCombineModalOpen(true)}>
                  <CombineLayersIcon /> Combine into a choice
                </ActionButton>
              ) : null}
            </div>
          ) : null}
          {combineModalOpen ? (
            <CombinePaintingAnnotationsModal
              candidates={candidates}
              annotationPageId={annotationPage}
              onClose={() => setCombineModalOpen(false)}
              onCombined={(annotationRef, index) => {
                setCombineModalOpen(false);
                annotationActions.edit(annotationRef, index);
              }}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function CombinePaintingAnnotationsModal({
  annotationPageId,
  candidates,
  onClose,
  onCombined,
}: {
  annotationPageId: string;
  candidates: PaintingChoiceCandidate[];
  onClose: () => void;
  onCombined: (annotationRef: { id: string; type: "Annotation" }, index: number) => void;
}) {
  const vault = useVault();
  const {
    i18n: { defaultLanguage },
  } = useConfig();
  const eligibleIds = useMemo(
    () => candidates.filter((candidate) => candidate.eligible).map((candidate) => candidate.annotationRef.id),
    [candidates],
  );
  const eligibleKey = eligibleIds.join("|");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(eligibleIds));
  const selectedCount = selectedIds.size;

  useEffect(() => {
    setSelectedIds(new Set(eligibleIds));
  }, [eligibleKey]);

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const combine = () => {
    const selectedAnnotationIds = Array.from(selectedIds);
    const firstSelectedIndex = candidates.find((candidate) => selectedIds.has(candidate.annotationRef.id))?.index || 0;
    const annotationRef = combinePaintingAnnotationsIntoChoice(vault, {
      annotationPageRef: { id: annotationPageId, type: "AnnotationPage" },
      selectedAnnotationIds,
      defaultLanguage,
    });
    onCombined(annotationRef, firstSelectedIndex);
  };

  return (
    <Modal
      title="Combine into a choice"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          <ActionButton onPress={onClose}>Cancel</ActionButton>
          <ActionButton primary isDisabled={selectedCount < 2} onPress={combine}>
            Combine {selectedCount} item{selectedCount === 1 ? "" : "s"}
          </ActionButton>
        </div>
      }
    >
      <p className="px-4 pt-3 pb-1 text-sm text-gray-500">
        Select two or more media items to group them as viewer-selectable options.
      </p>
      <div className="flex flex-col gap-2 p-4 pt-2">
        {candidates.map((candidate) => {
          const checked = selectedIds.has(candidate.annotationRef.id);
          return (
            <label
              key={candidate.annotationRef.id || candidate.index}
              className={[
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                !candidate.eligible
                  ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                  : checked
                    ? "border-me-500 bg-me-50 cursor-pointer"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="sr-only"
                disabled={!candidate.eligible}
                checked={checked}
                onChange={() => toggle(candidate.annotationRef.id)}
              />
              <AnnotationContext annotation={candidate.annotationRef.id}>
                <PaintingAnnotationCandidateThumbnail checked={checked} eligible={candidate.eligible} />
              </AnnotationContext>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-semibold ${candidate.eligible ? "text-gray-900" : "text-gray-400"}`}>
                  {candidate.label}
                </span>
                <span className={`block truncate text-xs mt-0.5 ${candidate.eligible ? "text-gray-500" : "text-gray-400"}`}>
                  {candidate.detail}
                </span>
              </span>
              {candidate.eligible ? (
                <div
                  className={[
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                    checked ? "bg-me-500 border-me-500" : "border-gray-300 bg-white",
                  ].join(" ")}
                >
                  {checked ? <CheckIcon className="text-white" style={{ fontSize: "11px", width: "11px", height: "11px" }} /> : null}
                </div>
              ) : null}
            </label>
          );
        })}
      </div>
    </Modal>
  );
}

function PaintingAnnotationCandidateThumbnail({ checked, eligible }: { checked?: boolean; eligible?: boolean }) {
  const thumbnail = useAnnotationThumbnail();

  return (
    <div
      className={[
        "w-12 h-12 rounded flex-shrink-0 overflow-hidden flex items-center justify-center transition-colors",
        eligible ? (checked ? "bg-me-100" : "bg-gray-100") : "bg-gray-100",
      ].join(" ")}
    >
      {thumbnail ? <ThumbnailImg src={thumbnail.id} alt="" className="object-contain w-full h-full" /> : null}
    </div>
  );
}

function CombineLayersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
