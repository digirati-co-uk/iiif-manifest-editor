import { getValue } from "@iiif/helpers";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { manifestMessage } from "../i18n";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, AudioIcon, Form, VideoIcon, WarningMessage } from "@manifest-editor/components";
import { defineCreator, type CreatorContext, type CreatorFunctionContext } from "@manifest-editor/creator-api";
import { type FormEvent, type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AvCanvas } from "./av-media-utils";
import {
  createTemporalCanvasReference,
  formatTime,
  parseTimeInput,
  validateTemporalSegments,
  type TemporalRangeSegment,
} from "./temporal-range-utils";

export const AV_TEMPORAL_RANGE_CREATOR_ID = "@manifest-editor/av-temporal-range";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/av-temporal-range": typeof avTemporalRangeCreator;
    }
  }
}

export interface AvTemporalRangeCreatorPayload {
  type: "Range";
  label: InternationalString;
  canvasId: string;
  start: number;
  end: number;
  behavior?: string[];
}

export async function createAvTemporalRange(data: AvTemporalRangeCreatorPayload, ctx: CreatorFunctionContext) {
  const rangeId = ctx.generateId("range", ctx.getParent());

  return ctx.embed({
    id: rangeId,
    type: "Range",
    label: data.label,
    behavior: data.behavior?.length ? data.behavior : undefined,
    items: [createTemporalCanvasReference(data.canvasId, data.start, data.end)],
  });
}

export function AvTemporalRangeCreatorForm(props: CreatorContext<AvTemporalRangeCreatorPayload>) {
  const t = useTranslations("manifest");
  const { resolveMessage } = useEditorI18n();
  const initial = props.options.initialData || {};
  const canvas = initial.canvas as AvCanvas | undefined;
  const canvasId = (initial.canvasId || canvas?.id) as string | undefined;
  const existingSegments = (initial.segments || []) as Array<
    Pick<TemporalRangeSegment, "id" | "title" | "start" | "end">
  >;
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [title, setTitle] = useState(initial.title || "Untitled range");
  const [start, setStart] = useState(formatTime(initial.start || 0));
  const [end, setEnd] = useState(formatTime(initial.end || Math.min(canvas?.duration || 0, 30)));
  const [noNav, setNoNav] = useState(false);

  const parsed = useMemo(() => {
    const startTime = parseTimeInput(start);
    const endTime = parseTimeInput(end);
    const errors: ReturnType<typeof manifestMessage>[] = [];
    if (startTime === null || endTime === null) {
      errors.push(manifestMessage("workflow.readableTimes"));
    } else if (canvas) {
      const validation = validateTemporalSegments(
        [
          ...existingSegments,
          {
            id: "__draft__",
            title,
            start: startTime,
            end: endTime,
          },
        ],
        canvas.duration,
        { requireTitle: true }
      );
      if (!validation.valid) {
        errors.push(validation.issues[0]?.messageReference || manifestMessage("workflow.rangeIsInvalid"));
      }
    } else {
      if (endTime <= startTime) {
        errors.push(manifestMessage("workflow.endAfterStart"));
      }
    }
    if (!canvasId) errors.push(manifestMessage("workflow.canvasMissing"));
    return { startTime, endTime, errors };
  }, [start, end, title, canvas, canvasId, existingSegments]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (parsed.startTime === null || parsed.endTime === null || parsed.errors.length || !canvasId) {
      return;
    }
    props.runCreate({
      type: "Range",
      label: { en: [title.trim()] },
      canvasId,
      start: parsed.startTime,
      end: parsed.endTime,
      behavior: noNav ? ["no-nav"] : [],
    });
  };

  const preview = () => {
    if (!mediaRef.current || parsed.startTime === null || parsed.endTime === null) {
      return;
    }
    mediaRef.current.currentTime = parsed.startTime;
    mediaRef.current.play();
  };

  const clipMediaToRange = (media: HTMLMediaElement) => {
    if (parsed.startTime === null || parsed.endTime === null || parsed.endTime <= parsed.startTime) {
      return;
    }
    if (media.currentTime < parsed.startTime || media.currentTime >= parsed.endTime) {
      media.currentTime = parsed.startTime;
    }
  };

  const onPreviewTimeUpdate = (event: SyntheticEvent<HTMLMediaElement>) => {
    if (parsed.endTime === null) return;
    if (event.currentTarget.currentTime >= parsed.endTime) {
      event.currentTarget.pause();
      event.currentTarget.currentTime = parsed.endTime;
    }
  };

  useEffect(() => {
    if (
      !mediaRef.current ||
      parsed.startTime === null ||
      parsed.endTime === null ||
      parsed.endTime <= parsed.startTime
    ) {
      return;
    }
    mediaRef.current.currentTime = parsed.startTime;
  }, [parsed.startTime, parsed.endTime]);

  return (
    <Form.Form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex items-start gap-3">
        {canvas?.media.type === "Video" ? <VideoIcon className="text-2xl" /> : <AudioIcon className="text-2xl" />}
        <div className="min-w-0">
          <h3 className="font-semibold text-lg">{t("workflow.createAVRange")}</h3>
          <p className="text-sm text-me-gray-700 truncate">
            {canvas ? getValue(canvas.label) || t("workflow.untitledCanvas") : initial.canvasId}
          </p>
        </div>
      </div>

      {canvas ? (
        <div className="rounded border border-me-gray-300 bg-me-gray-50 p-2">
          {canvas.media.type === "Video" ? (
            <video
              ref={mediaRef as any}
              src={canvas.media.id}
              controls
              className="max-h-64 w-full bg-black object-contain"
              onPlay={(event) => clipMediaToRange(event.currentTarget)}
              onSeeking={(event) => clipMediaToRange(event.currentTarget)}
              onTimeUpdate={onPreviewTimeUpdate}
            />
          ) : (
            <audio
              ref={mediaRef as any}
              src={canvas.media.id}
              controls
              className="w-full"
              onPlay={(event) => clipMediaToRange(event.currentTarget)}
              onSeeking={(event) => clipMediaToRange(event.currentTarget)}
              onTimeUpdate={onPreviewTimeUpdate}
            />
          )}
        </div>
      ) : null}

      <Form.InputContainer>
        <Form.Label htmlFor="av-create-title">{t("workflow.title")}</Form.Label>
        <Form.Input id="av-create-title" value={title} onChange={(event: any) => setTitle(event.currentTarget.value)} />
      </Form.InputContainer>

      <div className="grid grid-cols-2 gap-3">
        <Form.InputContainer>
          <Form.Label htmlFor="av-create-start">{t("workflow.start")}</Form.Label>
          <Form.Input
            id="av-create-start"
            value={start}
            onChange={(event: any) => setStart(event.currentTarget.value)}
          />
        </Form.InputContainer>
        <Form.InputContainer>
          <Form.Label htmlFor="av-create-end">{t("workflow.end")}</Form.Label>
          <Form.Input id="av-create-end" value={end} onChange={(event: any) => setEnd(event.currentTarget.value)} />
        </Form.InputContainer>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span>
          {t("workflow.duration")}{" "}
          {parsed.startTime !== null && parsed.endTime !== null
            ? formatTime(Math.max(0, parsed.endTime - parsed.startTime))
            : t("workflow.invalid")}
        </span>
        <ActionButton type="button" onPress={preview}>
          {t("workflow.previewSelection")}
        </ActionButton>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={noNav} onChange={(event) => setNoNav(event.currentTarget.checked)} />
        {t("workflow.hiddenFromNavigation")}
      </label>

      {parsed.errors[0] ? <WarningMessage>{resolveMessage(parsed.errors[0])}</WarningMessage> : null}

      <ActionButton primary type="submit" isDisabled={!!parsed.errors.length}>
        {t("range.create")}
      </ActionButton>
    </Form.Form>
  );
}

export const avTemporalRangeCreator = defineCreator({
  id: AV_TEMPORAL_RANGE_CREATOR_ID,
  create: createAvTemporalRange,
  label: "A/V temporal range",
  labelMessage: manifestMessage("workflow.aVTemporalRange"),
  summary: "Create a temporal range on an audio or video canvas",
  summaryMessage: manifestMessage("workflow.temporalCreatorSummary"),
  icon: <AudioIcon />,
  resourceType: "Range",
  resourceFields: ["id", "label", "type", "items", "behavior"],
  supports: {
    initialData: true,
    parentTypes: ["Manifest"],
    parentFields: ["structures"],
  },
  staticFields: {
    type: "Range",
  },
  render(ctx) {
    return <AvTemporalRangeCreatorForm {...ctx} />;
  },
});
