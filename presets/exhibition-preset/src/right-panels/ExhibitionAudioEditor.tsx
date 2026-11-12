import { probeAudioDuration, replaceAudioRecording } from "../audio-recording";
import { Sidebar, SidebarContent, SidebarTabs } from "@manifest-editor/components";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider, useEditor } from "@manifest-editor/shell";
import { useCanvas, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { useEffect, useRef, useState } from "react";
import {
  audioHeightOptions,
  audioPlacementOptions,
  audioWidthOptions,
  getGridUnit,
  getScrollAudioPlacement,
  resolveAudioLayoutKind,
  setAudioOverlay,
  setGridUnit,
  setScrollAudioPlacement,
} from "../audio-layout";
import { isAudioCanvas, resolveAudioSlideControls } from "../audio-slide";
import { getCanvasSound } from "../audio-waveform-baking";
import { getThemeConfigFromServices } from "../theme/theme-service";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";
import { ReadonlyExhibitionSummary } from "./ExhibitionCanvasEditor";
import { ExhibitionSummaryPanel } from "./ExhibitionSummaryEditor";
import { AudioWaveformBake } from "./AudioWaveformBake";
import { AudioArtworkPanel } from "./AudioArtworkPanel";
import {
  AudioAlert,
  AudioButton,
  AudioHint,
  AudioPanelSection,
  describeAudioSource,
  formatAudioDuration,
} from "./AudioPanelParts";
import {
  computeFitWidth,
  FloatingPositionPicker,
  getFloatingBehavior,
  hasFloatingBehavior,
  injectTextPlaceholders,
  LayoutPresetCard,
  replaceLayoutBehavior,
  SimpleCheckbox,
  SimpleField,
  SimpleFieldLabel,
  SimpleOptionButton,
  simpleLayoutColours,
  useExhibitionTemplateControls,
  getLayoutPreset,
  type FloatingBehavior,
  type LayoutPreset,
} from "./SlideBehaviours";

const audioSupports: EditorDefinition["supports"] = {
  edit: true,
  resourceTypes: ["Canvas"],
  properties: ["behavior", "accompanyingCanvas", "duration", "seeAlso"],
  custom: ({ resource }, vault) => isAudioCanvas(vault, vault.get((resource as any).source || resource)),
};

export const exhibitionAudioEditor: EditorDefinition = {
  id: "@exhibition/audio",
  label: "Exhibition",
  supports: audioSupports,
  component: () => <ExhibitionAudioPanel />,
};
export const exhibitionAudioLayoutEditor: EditorDefinition = {
  id: "@exhibition/audio-layout",
  label: "Layout",
  supports: audioSupports,
  component: () => <AudioLayoutPanel />,
};
export const exhibitionAudioImagesEditor: EditorDefinition = {
  id: "@exhibition/audio-images",
  label: "Images",
  supports: audioSupports,
  component: () => <AudioArtworkPanel />,
};
export const exhibitionAudioEditors = [exhibitionAudioEditor, exhibitionAudioLayoutEditor, exhibitionAudioImagesEditor];

/** Exhibition tab: the overview. Slide text first, then what is sound-specific (recording, playback, waveform). */
export function ExhibitionAudioPanel({ onEditText }: { onEditText?: () => void } = {}) {
  const canvas = useCanvas();
  if (!canvas) return null;
  return (
    <ResourceEditingProvider resource={canvas}>
      <Sidebar>
        <SidebarContent padding>
          <div className="flex flex-col gap-6">
            <ReadonlyExhibitionSummary canvas={canvas} onEdit={onEditText} />
            <AudioRecording />
            <AudioPlaybackSettings />
          </div>
        </SidebarContent>
      </Sidebar>
    </ResourceEditingProvider>
  );
}

function AudioRecording() {
  const canvas = useCanvas();
  const vault = useVault();
  const sound = useVaultSelector((_, v) => getCanvasSound(v, canvas), [canvas]);
  const [url, setUrl] = useState(sound?.id || "");
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), [canvas?.id]);
  useEffect(() => {
    setUrl(sound?.id || "");
    setReplacing(false);
    setError("");
  }, [canvas?.id, sound?.id]);
  if (!canvas || !sound) return null;
  const source = describeAudioSource(sound.id);
  const length = formatAudioDuration(canvas.duration || sound.duration);
  const save = async () => {
    if (loading) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    setError("");
    try {
      const duration = await probeAudioDuration(url, controller.signal);
      if (!controller.signal.aborted) replaceAudioRecording(vault, canvas.id, url, duration);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(reason instanceof Error ? reason.message : "Could not replace the recording.");
    } finally {
      if (pending.current === controller && !controller.signal.aborted) setLoading(false);
    }
  };
  const cancel = () => {
    pending.current?.abort();
    setLoading(false);
    setUrl(sound.id);
    setReplacing(false);
    setError("");
  };
  return (
    <AudioPanelSection title="Recording" label="Audio recording">
      <audio key={sound.id} src={sound.id} controls preload="metadata" className="w-full" />
      <div className="min-w-0" title={sound.id}>
        <div className="truncate text-sm font-semibold" style={{ color: simpleLayoutColours.text }}>
          {source.file}
        </div>
        <div className="truncate text-xs" style={{ color: simpleLayoutColours.muted }}>
          {[source.host, length].filter(Boolean).join(" · ")}
        </div>
      </div>
      {replacing ? (
        <div className="flex flex-col gap-3">
          <InputContainer $wide style={{ marginBottom: 0 }}>
            <InputLabel htmlFor="audio-recording-url">New audio URL</InputLabel>
            <Input
              id="audio-recording-url"
              type="url"
              autoFocus
              placeholder="https://example.org/recording.mp3"
              value={url}
              disabled={loading}
              onChange={(event: any) => setUrl(event.target.value)}
              onKeyDown={(event: any) => {
                if (event.key === "Enter" && url.trim() && url.trim() !== sound.id) save();
              }}
            />
          </InputContainer>
          <div className="flex flex-wrap gap-2">
            <AudioButton variant="primary" disabled={loading || !url.trim() || url.trim() === sound.id} onClick={save}>
              {loading ? "Checking recording…" : "Replace recording"}
            </AudioButton>
            <AudioButton onClick={cancel}>Cancel</AudioButton>
          </div>
          <AudioHint>
            The new file replaces this one. Waveform data is cleared; accompanying images and slide text are kept.
          </AudioHint>
        </div>
      ) : (
        <AudioButton className="self-start" onClick={() => setReplacing(true)}>
          Change recording…
        </AudioButton>
      )}
      {error ? <AudioAlert>{error}</AudioAlert> : null}
    </AudioPanelSection>
  );
}

function useAudioOptions() {
  const editor = useEditor();
  const manifest = useManifest();
  const behavior = editor.technical.behavior.get() || [];
  const theme =
    getThemeConfigFromServices((manifest as any)?.service) || getThemeConfigFromServices((manifest as any)?.services);
  return {
    behavior,
    options: resolveAudioSlideControls(behavior, theme?.audio),
    setGroup: (values: string[], value: string) =>
      editor.technical.behavior.set([...behavior.filter((item) => !values.includes(item)), value]),
  };
}

function AudioPlaybackSettings() {
  const { options, setGroup } = useAudioOptions();
  return (
    <>
      <AudioPanelSection
        title="Playback"
        description="Audio plays inside the slide, never full screen. Browsers may need the listener to press play first."
        label="Audio playback"
      >
        <SimpleCheckbox
          checked={options.showWaveform}
          label="Show waveform"
          onChange={(checked) =>
            setGroup(["audio-waveform", "no-audio-waveform"], checked ? "audio-waveform" : "no-audio-waveform")
          }
        />
        <SimpleCheckbox
          checked={options.autoplay}
          label="Request autoplay when visible"
          onChange={(checked) => setGroup(["autoplay", "no-autoplay"], checked ? "autoplay" : "no-autoplay")}
        />
      </AudioPanelSection>
      {options.showWaveform ? <AudioWaveformBake /> : null}
    </>
  );
}

export function AudioLayoutPanel() {
  const canvas = useCanvas();
  if (!canvas) return null;
  return (
    <ResourceEditingProvider resource={canvas}>
      <Sidebar>
        <SidebarContent padding>
          <AudioLayoutContent />
        </SidebarContent>
      </Sidebar>
    </ResourceEditingProvider>
  );
}

/** Only offers what the exhibition viewer renders for audio in the current format (full page / slideshow / scroll). */
function AudioLayoutContent() {
  const canvas = useCanvas();
  const vault = useVault();
  const manifest = useManifest();
  const { technical } = useEditor();
  const { behavior, options, setGroup } = useAudioOptions();
  const controls = useExhibitionTemplateControls(behavior, false);
  const kind = resolveAudioLayoutKind(controls);
  const preset = getLayoutPreset(behavior);
  const floating = hasFloatingBehavior(behavior);
  const set = (next: string[]) => technical.behavior.set(next);

  const choosePlacement = (next: LayoutPreset) => {
    set(replaceLayoutBehavior(behavior, next));
    if (canvas) injectTextPlaceholders(vault, canvas, next);
  };
  const toggleOverlay = (enabled: boolean) => {
    // A floated panel still needs a text placement, otherwise the viewer shows no text at all.
    const placed = enabled && preset === "image" ? replaceLayoutBehavior(behavior, "right") : behavior;
    if (placed !== behavior && canvas) injectTextPlaceholders(vault, canvas, "right");
    set(setAudioOverlay(placed, enabled ? getFloatingBehavior(behavior) : null));
  };
  const widthUnit = getGridUnit(behavior, "w-", 12);
  const heightUnit = getGridUnit(behavior, "h-", 8);
  const fit =
    kind === "fullpage" && manifest?.items && canvas
      ? computeFitWidth(canvas.id, manifest.items as any[], vault)
      : null;

  return (
    <div className="flex flex-col gap-7">
      <AudioHint>
        {kind === "scroll"
          ? "In a scrolling story the player fills a section, with the slide text on a card or beside it."
          : kind === "slideshow"
            ? "The player fills the slide. Slide text can sit beside it or float over it."
            : "The player sits in the page grid. Slide text can sit beside, above or below it."}
      </AudioHint>

      {kind !== "scroll" && !(kind === "slideshow" && floating) ? (
        <SimpleField>
          <SimpleFieldLabel>Text placement</SimpleFieldLabel>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {audioPlacementOptions.map((option) => (
              <LayoutPresetCard
                key={option.value}
                preset={option.value}
                label={option.label}
                selected={preset === option.value}
                onClick={() => choosePlacement(option.value)}
              />
            ))}
          </div>
        </SimpleField>
      ) : null}

      {kind === "slideshow" ? (
        <div className="flex flex-col gap-3">
          <SimpleCheckbox checked={floating} label="Overlay text on the player" onChange={toggleOverlay} />
          {floating ? (
            <SimpleField>
              <SimpleFieldLabel>Text overlay position</SimpleFieldLabel>
              <div className="mt-3">
                <FloatingPositionPicker
                  value={getFloatingBehavior(behavior)}
                  onChange={(next) => set(setAudioOverlay(behavior, next || null))}
                />
              </div>
            </SimpleField>
          ) : null}
        </div>
      ) : null}

      {kind === "scroll" ? <ScrollTextPlacement behavior={behavior} onChange={set} /> : null}

      {kind === "fullpage" ? (
        <>
          <SimpleField>
            <SimpleFieldLabel>Width</SimpleFieldLabel>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {audioWidthOptions.map((option) => (
                <SimpleOptionButton
                  key={option.value}
                  selected={widthUnit === option.value}
                  onClick={() => set(setGridUnit(behavior, "w-", option.value))}
                >
                  {option.label}
                </SimpleOptionButton>
              ))}
            </div>
          </SimpleField>
          {fit ? (
            <SimpleField>
              <SimpleFieldLabel>Fit alongside {fit.neighbour} slide</SimpleFieldLabel>
              <div className="mt-3">
                <SimpleOptionButton
                  selected={widthUnit === fit.width}
                  onClick={() => set(setGridUnit(behavior, "w-", fit.width))}
                >
                  w-{fit.width} — fills remaining space
                </SimpleOptionButton>
              </div>
            </SimpleField>
          ) : null}
          <SimpleField>
            <SimpleFieldLabel>Height</SimpleFieldLabel>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {audioHeightOptions.map((option) => (
                <SimpleOptionButton
                  key={option.value}
                  selected={heightUnit === option.value}
                  onClick={() => set(setGridUnit(behavior, "h-", option.value))}
                >
                  {option.label}
                </SimpleOptionButton>
              ))}
            </div>
            {audioHeightOptions.some((option) => option.value === heightUnit) ? null : (
              <div className="mt-2 text-center text-xs" style={{ color: simpleLayoutColours.muted }}>
                Custom height h-{heightUnit}
              </div>
            )}
          </SimpleField>
        </>
      ) : null}

      <SimpleField>
        <SimpleFieldLabel>Accompanying image</SimpleFieldLabel>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SimpleOptionButton
            selected={options.imageFit === "contain"}
            title="Show the whole image"
            onClick={() => setGroup(["image-cover", "image-contain", "cover", "contain"], "image-contain")}
          >
            Fit whole image
          </SimpleOptionButton>
          <SimpleOptionButton
            selected={options.imageFit === "cover"}
            title="Crop the image to fill the player"
            onClick={() => setGroup(["image-cover", "image-contain", "cover", "contain"], "image-cover")}
          >
            Fill player
          </SimpleOptionButton>
        </div>
      </SimpleField>
    </div>
  );
}

function ScrollTextPlacement({ behavior, onChange }: { behavior: string[]; onChange: (next: string[]) => void }) {
  const placement = getScrollAudioPlacement(behavior);
  const choices = [
    { mode: "floating" as const, label: "Card over player" },
    { mode: "left" as const, label: "Text on left" },
    { mode: "right" as const, label: "Text on right" },
  ];
  return (
    <>
      <SimpleField>
        <SimpleFieldLabel>Text placement</SimpleFieldLabel>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {choices.map((choice) => (
            <SimpleOptionButton
              key={choice.mode}
              selected={placement.mode === choice.mode}
              onClick={() =>
                onChange(setScrollAudioPlacement(behavior, { mode: choice.mode, position: placement.position }))
              }
            >
              {choice.label}
            </SimpleOptionButton>
          ))}
        </div>
      </SimpleField>
      {placement.mode === "floating" ? (
        <SimpleField>
          <SimpleFieldLabel>Card position</SimpleFieldLabel>
          <div className="mt-3">
            <FloatingPositionPicker
              value={placement.position}
              onChange={(next) => {
                // The centre cell clears an overlay elsewhere; a scrolling audio card always has a position.
                if (next) onChange(setScrollAudioPlacement(behavior, { mode: "floating", position: next }));
              }}
            />
          </div>
        </SimpleField>
      ) : null}
    </>
  );
}

/** The slideshow preset uses one shell tab; share the same sections inside it. */
export function ExhibitionAudioWorkbench() {
  const canvas = useCanvas();
  const [selected, setSelected] = useState("exhibition");
  const requested = useSlideshowWorkbenchState((state) => state.requestedTab);
  const clear = useSlideshowWorkbenchState((state) => state.clearRequestedTab);
  const mode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const hideTours = useSlideshowWorkbenchState((state) => state.setShowTourSteps);
  useEffect(() => {
    setSelected("exhibition");
    hideTours(false);
  }, [canvas?.id, hideTours]);
  useEffect(() => {
    if (requested) {
      const tab = requested === "summary" ? "text" : requested;
      if (["exhibition", "layout", "images", "text"].includes(tab)) {
        setSelected(tab);
        mode(tab === "images" ? "edit" : "preview");
      }
      clear();
    }
  }, [requested, clear, mode]);
  return (
    <SidebarTabs
      menuId="audio-slide-sections"
      selectedKey={selected}
      onSelectionChange={(tab) => {
        setSelected(tab);
        mode(tab === "images" ? "edit" : "preview");
      }}
      menu={[
        {
          id: "exhibition",
          label: "Exhibition",
          renderComponent: () => (
            <ExhibitionAudioPanel
              onEditText={() => {
                setSelected("text");
                mode("preview");
              }}
            />
          ),
        },
        { id: "layout", label: "Layout", renderComponent: () => <AudioLayoutPanel /> },
        { id: "images", label: "Images", renderComponent: () => <AudioArtworkPanel /> },
        { id: "text", label: "Text content", renderComponent: () => <ExhibitionSummaryPanel /> },
      ]}
    />
  );
}
