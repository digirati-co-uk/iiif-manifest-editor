import type { Reference } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import { useEditor, useLayoutActions } from "@manifest-editor/shell";
import { Accordion } from "@manifest-editor/ui/atoms/Accordion";
import { Button, ButtonGroup } from "@manifest-editor/ui/atoms/Button";
import { FlexContainerColumn, FlexImage } from "@manifest-editor/ui/components/layout/FlexContainer";
import { DeleteButton } from "@manifest-editor/ui/DeleteButton";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { ThumbnailContainer } from "@manifest-editor/ui/atoms/ThumbnailContainer";
import { useMemo } from "react";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { AnnotationPreview } from "../../components/AnnotationPreview/AnnotationPreview";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { ReorderList } from "../../components/ReorderList/ReorderList.dndkit";
import { centerRectangles } from "../../helpers/center-rectangles";
import {
  ensureChoiceBodyRef,
  getChoiceBodyInfo,
  getChoiceItems,
  getInternationalStringText,
  type ChoiceBodyInfo,
  type ChoiceItemInfo,
  updateChoiceField,
  updateChoiceItemLabel,
  updateChoiceItems,
} from "../../helpers/choice-painting-annotations";
import { useContentResourceThumbnail } from "../../hooks/useContentResourceThumbnailHelper";
import { MediaTargetEditor } from "../MediaEditor/MediaTargetEditor";

type SortableChoiceItem = ChoiceItemInfo & { id: string };

export function ChoicePaintingAnnotationEditor() {
  const vault = useVault();
  const annotationEditor = useEditor();
  const annotationRef = annotationEditor.ref() as Reference<"Annotation">;
  const { create, edit } = useLayoutActions();
  const { target } = annotationEditor.annotation;
  const canvasId = target.getSourceId();
  const canvas = useCanvas({ id: canvasId });
  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();
  const state = useVaultSelector(
    (_, selectorVault) => {
      const annotation = selectorVault.get(annotationRef as any, { skipSelfReturn: false } as any) as any;
      const choiceInfo = annotation ? getChoiceBodyInfo(annotation, selectorVault as any) : null;
      const choiceItems = choiceInfo ? getChoiceItems(choiceInfo.choice, selectorVault as any) : [];
      return { annotation, choiceInfo, choiceItems };
    },
    [annotationRef.id],
  );

  const sortableItems = useMemo<SortableChoiceItem[]>(
    () =>
      state.choiceItems.map((item) => ({
        ...item,
        id: item.ref?.id || item.resource?.id || `${annotationRef.id}/choice-item/${item.index}`,
      })),
    [state.choiceItems, annotationRef.id],
  );

  if (!state.choiceInfo) {
    return null;
  }

  const choiceInfo = state.choiceInfo;
  const choiceItems = state.choiceItems;
  const firstImage = choiceItems.find((item) => item.ref || item.resource?.id);

  const moveAndResizeImage = () => {
    vault.batch(() => {
      if (!canvas) {
        return;
      }
      const imagePosition = centerRectangles(
        canvas,
        {
          width: firstImage?.resource?.width || 100,
          height: firstImage?.resource?.height || 100,
        },
        0.6,
      );

      target.setPosition(imagePosition);
    });
  };

  const choiceLabel = (
    <LanguageFieldEditor
      focusId={`${annotationRef.id}_Choice_label`}
      label="Choice label"
      fields={choiceInfo.choice.label || {}}
      onSave={(e: any) => updateChoiceField(vault, annotationRef, choiceInfo, "label", e.toInternationalString())}
    />
  );

  const items = (
    <div className="flex flex-col gap-2">
      <ReorderList
        id={`${annotationRef.id}_choice_items`}
        items={sortableItems}
        inlineHandle={false}
        marginBottom="0.5em"
        reorder={({ startIndex, endIndex }) => {
          const nextItems = moveItem(
            choiceItems.map((item) => item.item),
            startIndex,
            endIndex,
          );
          updateChoiceItems(vault, annotationRef, choiceInfo, nextItems);
        }}
        renderItem={(item) => (
          <ChoiceItemEditorRow
            annotationRef={annotationRef}
            choiceInfo={choiceInfo}
            item={item}
            canRemove={choiceItems.length > 2}
          />
        )}
      />

      <ActionButton
        onPress={() => {
          const parent = ensureChoiceBodyRef(vault, annotationRef, choiceInfo);
          create({
            type: "ContentResource",
            filter: "image",
            parent,
            property: "items",
            isPainting: true,
          });
        }}
      >
        Add media option
      </ActionButton>
    </div>
  );

  const targetElements = (
    <>
      {canvas && !currentTarget.selector ? (
        <InputContainer $wide>
          <InputLabel $margin>Target</InputLabel>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 3,
              padding: "1em",
              color: "#999",
            }}
          >
            This choice fills the whole Canvas.
          </div>
          <ButtonGroup $right>
            <Button onClick={moveAndResizeImage}>Change</Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}
      {currentSelector && currentSelector.type === "BoxSelector" ? <MediaTargetEditor /> : null}
    </>
  );

  return (
    <FlexContainerColumn>
      <FlexImage>{firstImage?.ref ? <ChoiceItemThumbnail resourceId={firstImage.ref.id} large /> : null}</FlexImage>

      <InputContainer $wide>
        <Input disabled value={annotationRef.id} />
      </InputContainer>

      <Accordion
        items={[
          {
            label: "Choice",
            initialOpen: true,
            children: choiceLabel,
          },
          {
            label: "Options",
            initialOpen: true,
            children: items,
          },
          {
            label: "Target",
            initialOpen: currentSelector !== null,
            children: targetElements,
          },
        ]}
      />

      {annotationEditor.context ? (
        <DeleteButton
          label="Remove from canvas"
          message="Are you sure you want to remove from canvas"
          onDelete={() => {
            annotationEditor.context?.removeFromParent();
            edit(annotationEditor.ref());
          }}
        >
          <AnnotationPreview />
        </DeleteButton>
      ) : null}
    </FlexContainerColumn>
  );
}

function ChoiceItemEditorRow({
  annotationRef,
  choiceInfo,
  item,
  canRemove,
}: {
  annotationRef: Reference<"Annotation">;
  choiceInfo: ChoiceBodyInfo;
  item: SortableChoiceItem;
  canRemove: boolean;
}) {
  const vault = useVault();
  const { edit } = useLayoutActions();
  const title = getInternationalStringText(item.resource?.label, `Option ${item.index + 1}`);

  return (
    <div className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <ChoiceItemThumbnail resourceId={item.ref?.id} />
        <button
          type="button"
          className="min-w-0 flex-1 border-none bg-transparent p-0 text-left"
          onClick={() => {
            if (item.ref) {
              edit(
                item.ref,
                choiceInfo.ref ? { parent: choiceInfo.ref, property: "items", index: item.index } : undefined,
                { forceOpen: true },
              );
            }
          }}
        >
          <span className="block truncate text-sm font-medium text-gray-900">{title}</span>
          <span className="block truncate text-xs text-gray-500">
            {item.resource?.format || item.resource?.type || item.ref?.id}
          </span>
        </button>
        <ActionButton
          isDisabled={!canRemove}
          onPress={() => {
            const items = choiceInfo.choice.items || [];
            updateChoiceItems(
              vault,
              annotationRef,
              choiceInfo,
              items.filter((_choiceItem, index) => index !== item.index),
            );
          }}
        >
          Remove
        </ActionButton>
      </div>

      <LanguageFieldEditor
        focusId={`${item.id}_label`}
        label="Option label"
        fields={item.resource?.label || {}}
        onSave={(e: any) => updateChoiceItemLabel(vault, annotationRef, choiceInfo, item, e.toInternationalString())}
        disableMultiline
      />
    </div>
  );
}

function ChoiceItemThumbnail({ resourceId, large }: { resourceId?: string; large?: boolean }) {
  if (!resourceId) {
    return null;
  }

  return <ChoiceItemThumbnailInner resourceId={resourceId} large={large} />;
}

function ChoiceItemThumbnailInner({ resourceId, large }: { resourceId: string; large?: boolean }) {
  const thumbnail = useContentResourceThumbnail({ resourceId });

  if (!thumbnail) {
    return null;
  }

  if (large) {
    return <img src={thumbnail.id} alt="" />;
  }

  return (
    <ThumbnailContainer $size={40}>
      <ThumbnailImg src={thumbnail.id} alt="" />
    </ThumbnailContainer>
  );
}

function moveItem<T>(items: T[], startIndex: number, endIndex: number) {
  if (startIndex === endIndex || startIndex < 0 || endIndex < 0) {
    return items;
  }
  const next = [...items];
  const [removed] = next.splice(startIndex, 1);
  if (typeof removed === "undefined") {
    return items;
  }
  next.splice(endIndex, 0, removed);
  return next;
}
