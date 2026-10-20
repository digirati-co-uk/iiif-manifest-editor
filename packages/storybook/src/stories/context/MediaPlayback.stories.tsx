import type { Meta, StoryObj } from "@storybook/react-vite";
import { IIIFMediaPlayer, useCanvasRenderingStrategy } from "@manifest-editor/components";
import { useState } from "react";
import { CanvasContext, LocaleString, useCanvas, useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function Player({ startTime }: { startTime: number }) {
  const canvas = useCanvas();
  const strategy = useCanvasRenderingStrategy();
  if (!canvas || strategy.type !== "media" || (strategy.media.type !== "Sound" && strategy.media.type !== "Video"))
    return <output>Resolving media strategy…</output>;
  return (
    <div className="sb-split" style={{ flex: 1, height: "auto", minHeight: 0 }}>
      <div className="sb-pane" style={{ height: 440 }}>
        <IIIFMediaPlayer
          canvas={{ id: canvas.id }}
          media={strategy.media}
          captions={strategy.captions}
          startTime={startTime}
        />
      </div>
      <JsonPanel
        title="Resolved media"
        value={{
          canvas: canvas.id,
          type: strategy.media.type,
          url: strategy.media.url,
          format: strategy.media.format,
          duration: strategy.media.duration,
        }}
      />
    </div>
  );
}

function MediaCanvas({ startTime }: { startTime: number }) {
  const manifest = useManifest();
  const canvas = manifest?.items[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <LocaleString as="h2">{manifest?.label}</LocaleString>
      {canvas ? (
        <CanvasContext canvas={canvas.id}>
          <Player startTime={startTime} />
        </CanvasContext>
      ) : null}
    </div>
  );
}

function MediaPlayback({ kind = "audio", startTime = 0 }: { kind?: "audio" | "video"; startTime?: number }) {
  const [version, setVersion] = useState(0);
  const resource = resources[kind];
  return (
    <StoryFrame
      title="IIIF media playback"
      summary="The production media player resolves the actual Cookbook painting annotation. Playback starts only when you press Play; Reset starts a fresh player."
      source={resource}
      onReset={() => setVersion((v) => v + 1)}
    >
      <HeadlessEditor key={`${resource}-${version}-${startTime}`} resource={resource}>
        <MediaCanvas startTime={startTime} />
      </HeadlessEditor>
    </StoryFrame>
  );
}

const meta = {
  title: "Components with context/Media playback",
  component: MediaPlayback,
  args: { kind: "audio", startTime: 0 },
  argTypes: {
    kind: { control: "inline-radio", options: ["audio", "video"] },
    startTime: { control: { type: "number", min: 0, max: 500, step: 5 } },
  },
} satisfies Meta<typeof MediaPlayback>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CookbookAudio: Story = {};
export const CookbookVideo: Story = { args: { kind: "video" } };
