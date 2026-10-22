import type { Meta, StoryObj } from "@storybook/react-vite";
import { HTMLAnnotationBodyRender } from "@manifest-editor/components";
import { useState } from "react";
import { AnnotationContext, useCanvas, useManifest, useVault } from "react-iiif-vault";
import { HeadlessEditor } from "../../support/HeadlessEditor";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

const textResources = {
  plain: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json",
  html: "https://iiif.io/api/cookbook/recipe/0019-html-in-annotations/manifest.json",
};

function AnnotationBody({ locale }: { locale: string }) {
  const manifest = useManifest();
  const canvas = useCanvas({ id: manifest?.items[0]?.id });
  const vault = useVault();
  const pageRef = canvas?.annotations[0];
  const page = pageRef ? vault.get(pageRef) : undefined;
  const annotation = page?.items[0];
  if (!annotation) return <p>No textual annotation available.</p>;
  return (
    <div className="sb-split">
      <div className="sb-pane">
        <AnnotationContext annotation={annotation.id}>
          <HTMLAnnotationBodyRender locale={locale} />
        </AnnotationContext>
      </div>
      <JsonPanel title="Source annotation" value={vault.toPresentation3(annotation)} />
    </div>
  );
}

function TextAnnotations({ kind = "plain", locale = "de" }: { kind?: "plain" | "html"; locale?: string }) {
  const [version, setVersion] = useState(0);
  const resource = textResources[kind];
  return (
    <StoryFrame
      title="Textual annotation bodies"
      summary="The real annotation body renderer reads a remote Cookbook annotation, including HTML links and images when the body is HTML."
      source={resource}
      onReset={() => setVersion((v) => v + 1)}
    >
      <HeadlessEditor key={`${resource}-${version}`} resource={resource}>
        <AnnotationBody locale={locale} />
      </HeadlessEditor>
    </StoryFrame>
  );
}
const meta = {
  title: "Components with context/Text annotations",
  component: TextAnnotations,
  args: { kind: "plain", locale: "de" },
  argTypes: { kind: { control: "inline-radio", options: ["plain", "html"] } },
} satisfies Meta<typeof TextAnnotations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PlainTextBody: Story = {};
export const HTMLBodyWithLinks: Story = { args: { kind: "html" } };
