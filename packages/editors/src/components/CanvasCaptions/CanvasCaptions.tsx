import { contentLanguageName } from "../../i18n";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { getValue } from "@iiif/helpers";
import { canvasHasAv, getCanvasCaptionTracks } from "@manifest-editor/editor-api";
import { useCreator, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { useVaultSelector } from "react-iiif-vault";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { ActionButton, AddIcon, EmptyState } from "@manifest-editor/components";
import { InputLabel } from "../Input";

export interface CanvasCaptionTrack {
  annotationId: string;
  id: string;
  label: string;
  language?: string;
  format?: string;
  onEdit: () => void;
}

export interface CanvasCaptionsProps {
  tracks: CanvasCaptionTrack[];
  canCreate: boolean;
  onCreate: () => void;
}

const FORMAT_NAMES: Record<string, string> = {
  "text/vtt": "WebVTT",
  "text/srt": "SRT",
  "application/x-subrip": "SRT",
  "application/ttml+xml": "TTML",
};

function formatName(format?: string) {
  if (!format) return null;
  const key = format.trim().toLowerCase();
  return FORMAT_NAMES[key] || format;
}

function CanvasCaptionsView({ tracks, canCreate, onCreate }: CanvasCaptionsProps) {
  const t = useTranslations("editors");
  const { locale } = useEditorI18n();
  return (
    <section aria-label={t("ui.subtitlesAndCaptions")} className="mb-2">
      <InputLabel as="h3">{t("ui.subtitlesAndCaptions")}</InputLabel>

      {tracks.length === 0 ? (
        <div className="mb-2">
          <EmptyState $noMargin $box>
            {t("ui.noSubtitlesOrCaptions")}
          </EmptyState>
        </div>
      ) : (
        <ul className="mb-2">
          {tracks.map((track) => (
            <li key={`${track.annotationId}/${track.id}`}>
              <RichMediaLink
                margin
                title={track.label}
                label={[
                  formatName(track.format),
                  track.language ? contentLanguageName(track.language, locale, t("language.none")) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                icon={<TextFormatIcon className="text-2xl" />}
                noLink
                link={track.id}
                onClick={track.onEdit}
                containerProps={{
                  role: "button",
                  tabIndex: 0,
                  "aria-label": t("messages.editNamed", { label: track.label }),
                  title: track.id,
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      track.onEdit();
                    }
                  },
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {canCreate ? (
        <div className="flex flex-wrap gap-2">
          <ActionButton onPress={onCreate}>
            <AddIcon /> {t("ui.addSubtitlesOrCaptions")}
          </ActionButton>
        </div>
      ) : null}
    </section>
  );
}

export function CanvasCaptions() {
  const t = useTranslations("editors");
  const editor = useEditor();
  const canvas = editor.ref();
  const { edit } = useLayoutActions();
  const { isAv, tracks } = useVaultSelector(
    (_, vault) => ({ isAv: canvasHasAv(vault, canvas), tracks: getCanvasCaptionTracks(vault, canvas) }),
    [canvas.id]
  );
  const [canCreate, actions] = useCreator(canvas, "annotations", "AnnotationPage", undefined, { filter: "captions" });
  if (!isAv) return null;

  return (
    <CanvasCaptionsView
      canCreate={!!canCreate}
      onCreate={() => actions.create()}
      tracks={tracks.map((track) => ({
        annotationId: track.annotation.id,
        id: track.body.id,
        label: getValue(track.body.label) || t("messages.untitledCaptions"),
        language: track.body.language,
        format: track.body.format,
        onEdit: () =>
          edit(
            track.bodyRef,
            { parent: track.annotation, property: "body", index: track.bodyIndex },
            { selectedTab: "Descriptive" }
          ),
      }))}
    />
  );
}
