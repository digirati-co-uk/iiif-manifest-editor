import { ActionButton, AddIcon, Modal } from "@manifest-editor/components";
import { useAnnotationPageEditor, useConfig, useCreator } from "@manifest-editor/shell";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { ThumbnailContainer } from "@manifest-editor/ui/atoms/ThumbnailContainer";
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
                <ActionButton onPress={() => setCombineModalOpen(true)}>Combine into a choice</ActionButton>
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
            Combine {selectedCount} media
          </ActionButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2 p-4">
        {candidates.map((candidate) => {
          const checked = selectedIds.has(candidate.annotationRef.id);
          return (
            <label
              key={candidate.annotationRef.id || candidate.index}
              className={`flex items-center gap-3 rounded border p-3 text-sm ${
                candidate.eligible ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              <input
                type="checkbox"
                disabled={!candidate.eligible}
                checked={checked}
                onChange={() => toggle(candidate.annotationRef.id)}
              />
              <AnnotationContext annotation={candidate.annotationRef.id}>
                <PaintingAnnotationCandidateThumbnail />
              </AnnotationContext>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">{candidate.label}</span>
                <span className="block truncate text-gray-500">{candidate.detail}</span>
              </span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}

function PaintingAnnotationCandidateThumbnail() {
  const thumbnail = useAnnotationThumbnail();

  return (
    <ThumbnailContainer $size={40}>
      {thumbnail ? <ThumbnailImg src={thumbnail.id} alt="" /> : null}
    </ThumbnailContainer>
  );
}
