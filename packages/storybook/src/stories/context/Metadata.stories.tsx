import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState, MetadataContainer } from "@manifest-editor/components";
import { useState } from "react";
import { LocaleString, useManifest } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { resources } from "../../support/resources";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function DescriptiveMetadata({ showSummary }: { showSummary: boolean }) {
  const manifest = useManifest();
  if (!manifest) return null;
  return (
    <div className="sb-split">
      <div className="sb-pane">
        <LocaleString as="h2" defaultText="Untitled manifest">
          {manifest.label}
        </LocaleString>
        {showSummary && manifest.summary ? <LocaleString as="p">{manifest.summary}</LocaleString> : null}
        {manifest.metadata?.length ? (
          manifest.metadata.map((entry, index) => (
            <MetadataContainer key={index} label={entry.label}>
              <LocaleString as="p">{entry.value}</LocaleString>
            </MetadataContainer>
          ))
        ) : (
          <EmptyState $box>This manifest has no metadata entries.</EmptyState>
        )}
        {manifest.requiredStatement ? (
          <MetadataContainer label={manifest.requiredStatement.label}>
            <LocaleString as="p">{manifest.requiredStatement.value}</LocaleString>
          </MetadataContainer>
        ) : null}
        {manifest.rights ? (
          <p>
            <a href={manifest.rights} target="_blank" rel="noreferrer">
              Rights statement ↗
            </a>
          </p>
        ) : null}
      </div>
      <JsonPanel
        title="Descriptive properties"
        value={{
          label: manifest.label,
          summary: manifest.summary,
          metadata: manifest.metadata,
          requiredStatement: manifest.requiredStatement,
          rights: manifest.rights,
        }}
      />
    </div>
  );
}

function Metadata({ resource, showSummary = true }: { resource: string; showSummary?: boolean }) {
  const [version, setVersion] = useState(0);
  return (
    <StoryFrame
      title="Resource label and metadata"
      summary="LocaleString and the editor's metadata containers display the descriptive properties of a real manifest."
      source={resource}
      onReset={() => setVersion((v) => v + 1)}
    >
      <HeadlessEditor key={`${resource}-${version}`} resource={resource}>
        <DescriptiveMetadata showSummary={showSummary} />
      </HeadlessEditor>
    </StoryFrame>
  );
}

const meta = {
  title: "Components with context/Descriptive metadata",
  component: Metadata,
  args: { resource: resources.delftManifest, showSummary: true },
  argTypes: {
    resource: {
      control: "select",
      options: [resources.delftManifest, resources.multilingual, resources.book, resources.imageService],
    },
  },
} satisfies Meta<typeof Metadata>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ResourceLabelAndMetadata: Story = {};
