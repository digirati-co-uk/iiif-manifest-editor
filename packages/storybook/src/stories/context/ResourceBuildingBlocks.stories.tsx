import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectionListItem, LazyThumbnail, ManifestListItem, ViewProvider } from "@manifest-editor/components";
import { useState } from "react";
import { CanvasContext, useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

const providerManifest = "https://iiif.io/api/cookbook/recipe/0234-provider/manifest.json";

function Providers() {
  const manifest = useManifest();
  const [selected, setSelected] = useState<string>();
  return (
    <div className="sb-split">
      <div className="sb-pane">
        {manifest?.provider?.map((provider) => (
          <ViewProvider key={provider.id} resource={provider} onPress={() => setSelected(provider.id)} />
        ))}
      </div>
      <JsonPanel title="Selected provider" value={selected ? { id: selected, type: "Agent" } : null} />
    </div>
  );
}

function ThumbnailRegions({ cover }: { cover: boolean }) {
  const manifest = useManifest();
  const canvas = manifest?.items[0];
  if (!canvas) return <p>No canvas available.</p>;
  return (
    <CanvasContext canvas={canvas.id}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        <figure>
          <div style={{ width: 260, height: 260, position: "relative" }}>
            <LazyThumbnail cover={cover} />
          </div>
          <figcaption>Whole canvas</figcaption>
        </figure>
        <figure>
          <div style={{ width: 260, height: 260, position: "relative" }}>
            <LazyThumbnail region={{ x: 700, y: 900, width: 1100, height: 1100 }} singleImage cover={cover} />
          </div>
          <figcaption>Selected 1100 × 1100 region</figcaption>
        </figure>
      </div>
    </CanvasContext>
  );
}

function ResourceBuildingBlocks({
  example = "manifest",
  cover = false,
}: {
  example?: "manifest" | "collection" | "provider" | "regions";
  cover?: boolean;
}) {
  const [version, setVersion] = useState(0);
  const [active, setActive] = useState(false);
  const resource =
    example === "collection"
      ? resources.collection
      : example === "provider"
        ? providerManifest
        : resources.imageService;
  return (
    <StoryFrame
      title="Resource building blocks"
      summary="These list items, provider cards and image thumbnails resolve their resources from the real headless editor Vault."
      source={resource}
      onReset={() => {
        setVersion((v) => v + 1);
        setActive(false);
      }}
    >
      <HeadlessEditor key={`${resource}-${version}`} resource={resource}>
        {example === "provider" ? (
          <Providers />
        ) : example === "regions" ? (
          <div className="sb-pane">
            <ThumbnailRegions cover={cover} />
          </div>
        ) : (
          <div className="sb-pane">
            <ul aria-label="Resources">
              {example === "collection" ? (
                <CollectionListItem isActive={active} onAction={() => setActive((v) => !v)} />
              ) : (
                <ManifestListItem isActive={active} onAction={() => setActive((v) => !v)} />
              )}
            </ul>
            <output>{active ? "Resource activated" : "Choose the resource row"}</output>
          </div>
        )}
      </HeadlessEditor>
    </StoryFrame>
  );
}

const meta = {
  title: "Components with context/Resource building blocks",
  component: ResourceBuildingBlocks,
  args: { example: "manifest", cover: false },
  argTypes: { example: { control: "select", options: ["manifest", "collection", "provider", "regions"] } },
} satisfies Meta<typeof ResourceBuildingBlocks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ManifestRow: Story = {};
export const CollectionRow: Story = { args: { example: "collection" } };
export const ProviderLinksAndLogo: Story = { args: { example: "provider" } };
export const ThumbnailRegionsAndCover: Story = { args: { example: "regions" } };
