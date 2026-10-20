import { Vault } from "@iiif/helpers";
import type { Manifest, Reference } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import {
  Creator,
  getCreatorConfigKey,
  type CreatorContext,
  type CreatorDefinition,
  type CreatorOptions,
} from "@manifest-editor/creator-api";
import { useConfig, useInlineCreator } from "@manifest-editor/shell";
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import { EditorProviders, type LoadedResource } from "./HeadlessEditor";
import { JsonPanel, StoryFrame } from "./StoryFrame";

const manifestId = "https://example.org/storybook/manifest";
const canvas = { id: `${manifestId}/canvas`, type: "Canvas" } as const;
const page = { id: `${canvas.id}/page`, type: "AnnotationPage" } as const;
const notes = { id: `${canvas.id}/notes`, type: "AnnotationPage" } as const;
const range = { id: `${manifestId}/range`, type: "Range" } as const;
const avCanvas = { id: `${manifestId}/av-canvas`, type: "Canvas" } as const;
const annotation = { id: `${page.id}/annotation`, type: "Annotation" } as const;

function createFixture(): LoadedResource {
  const data: Manifest = {
    id: manifestId,
    type: "Manifest",
    label: { en: ["Creator playground"] },
    structures: [{ ...range, label: { en: ["Contents"] }, items: [canvas] }],
    items: [
      {
        ...canvas,
        width: 1000,
        height: 1000,
        duration: 600,
        items: [{ ...page, items: [] }],
        annotations: [
          {
            ...notes,
            items: [{ ...annotation, motivation: "commenting", target: canvas.id, body: [] }],
          },
        ],
      },
      {
        ...avCanvas,
        label: { en: ["Video canvas for captions"] },
        width: 480,
        height: 360,
        duration: 572.033333,
        items: [
          {
            id: `${avCanvas.id}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${avCanvas.id}/painting`,
                type: "Annotation",
                motivation: "painting",
                target: avCanvas.id,
                body: {
                  id: "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4",
                  type: "Video",
                  format: "video/mp4",
                  width: 480,
                  height: 360,
                  duration: 572.033333,
                },
              },
            ],
          },
        ],
      },
    ],
  };
  const vault = new Vault();
  vault.loadManifestSync(data.id, data);
  return { vault, resource: { id: data.id, type: "Manifest" }, data };
}

export type CreatorWorkbenchProps = {
  title: string;
  summary: string;
  creator: CreatorDefinition;
  parent:
    | "seeAlso"
    | "body"
    | "thumbnail"
    | "items"
    | "provider"
    | "structures"
    | "painting"
    | "commenting"
    | "annotations"
    | "captions"
    | "start"
    | "partOf"
    | "rangeItems";
  source?: string;
  initialData: Record<string, unknown>;
  example?: string;
};

export function CreatorWorkbench(props: CreatorWorkbenchProps) {
  const [reset, setReset] = useState(0);
  return (
    <StoryFrame
      title={props.title}
      summary={props.summary}
      source={props.source}
      onReset={() => setReset((n) => n + 1)}
    >
      <CreatorSession key={`${props.creator.id}-${reset}`} {...props} />
    </StoryFrame>
  );
}

function CreatorSession(props: CreatorWorkbenchProps) {
  const [loaded] = useState(createFixture);
  return (
    <EditorProviders loaded={loaded}>
      <CreatorForm {...props} />
    </EditorProviders>
  );
}

function CreatorForm({ creator, parent, initialData, example }: CreatorWorkbenchProps) {
  const vault = useVault();
  const registered = useInlineCreator();
  const api = useMemo(
    () =>
      registered.configs.some((item) => item.id === creator.id)
        ? registered
        : new Creator(vault, [...registered.configs, creator], registered.previewVault, registered.creatorConfig),
    [registered, creator, vault]
  );
  const config = useConfig();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const initialRequest = useRef<Promise<Reference | Reference[]> | null>(null);
  const creating = useRef(false);
  const mounted = useRef(false);
  const isAnnotation = parent === "painting" || parent === "commenting";
  const options = useMemo<CreatorOptions>(
    () => ({
      targetType: isAnnotation ? "Annotation" : creator.resourceType,
      parent: {
        resource:
          parent === "painting"
            ? page
            : parent === "commenting"
              ? notes
              : parent === "body"
                ? annotation
                : parent === "captions"
                  ? avCanvas
                  : parent === "annotations"
                    ? canvas
                    : parent === "rangeItems"
                      ? range
                      : { id: manifestId, type: "Manifest" },
        property: isAnnotation || parent === "rangeItems" ? "items" : parent === "captions" ? "annotations" : parent,
      },
      target: isAnnotation || parent === "body" ? canvas : undefined,
      initialData,
    }),
    [isAnnotation, creator.resourceType, parent, initialData]
  );
  const validate = useCallback(
    async (payload: unknown) => {
      await creator.validate?.(payload, vault);
      return true;
    },
    [creator, vault]
  );
  const createResource = useCallback(
    async (payload: unknown) => {
      await validate(payload);
      return api.create(creator.id, payload, options);
    },
    [api, creator.id, options, validate]
  );
  const showResult = useCallback(
    (reference: Reference | Reference[]) => {
      const serialize = (ref: Reference) => vault.toPresentation3(ref as any);
      setResult(Array.isArray(reference) ? reference.map(serialize) : serialize(reference));
    },
    [vault]
  );
  useEffect(() => {
    let active = true;
    mounted.current = true;
    creating.current = true;
    // Reuse the same creation across StrictMode's effect replay; each reset has its own session and Vault.
    const request = (initialRequest.current ??= createResource(initialData));
    request
      .then((reference) => {
        if (active) showResult(reference);
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (active) {
          creating.current = false;
          setBusy(false);
        }
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [createResource, initialData, showResult]);
  const runCreate = async (payload: unknown) => {
    if (creating.current) return;
    creating.current = true;
    setBusy(true);
    setError("");
    try {
      const reference = await createResource(payload);
      if (mounted.current) showResult(reference);
    } catch (error) {
      if (mounted.current) setError(error instanceof Error ? error.message : String(error));
    } finally {
      creating.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const context: CreatorContext = {
    vault,
    options,
    validate,
    runCreate,
    config: config.creators?.[getCreatorConfigKey(creator)] || {},
  };
  return (
    <div className="sb-creator-workbench">
      <section className="sb-creator-form" aria-label="Creator form">
        {example ? (
          <p className="sb-summary">
            Example link:{" "}
            <a href={example} target="_blank" rel="noreferrer">
              {example}
            </a>
          </p>
        ) : null}
        <fieldset
          disabled={busy}
          style={{ display: "flex", flexDirection: "column", border: 0, padding: 0, margin: 0, minWidth: 0 }}
          aria-busy={busy}
        >
          <Suspense fallback={<output style={{ display: "block" }}>Loading creator…</output>}>
            {creator.render ? creator.render(context) : <DefaultCreatorForm creator={creator} context={context} />}
          </Suspense>
        </fieldset>
        {busy ? <output style={{ display: "block" }}>Creating resource…</output> : null}
        {error ? <p role="alert">{error}</p> : null}
        {result ? <output style={{ display: "block" }}>Created.</output> : null}
      </section>
      <JsonPanel title="Created resource JSON" value={result ?? { status: "Creating the example resource…" }} />
    </div>
  );
}

function DefaultCreatorForm({ creator, context }: { creator: CreatorDefinition; context: CreatorContext }) {
  if (creator.resourceType === "Canvas") return <EmptyCanvasForm {...context} />;
  return <EmptyResourceForm creator={creator} {...context} />;
}

function EmptyResourceForm({ creator, options, runCreate }: CreatorContext & { creator: CreatorDefinition }) {
  const id = useId();
  const [label, setLabel] = useState(options.initialData.label || { en: [""] });
  return (
    <PaddedSidebarContainer>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          runCreate({
            label,
            ...(creator.resourceType === "Annotation" ? { motivation: String(data.get("motivation")) } : {}),
          });
        }}
      >
        <LanguageFieldEditor
          label="Label"
          focusId={`${id}-label`}
          fields={label}
          onSave={(value) => setLabel(value.toInternationalString())}
        />
        {creator.resourceType === "Annotation" ? (
          <InputContainer $wide>
            <InputLabel htmlFor={`${id}-motivation`}>Motivation</InputLabel>
            <Input
              id={`${id}-motivation`}
              name="motivation"
              defaultValue={options.initialData.motivation || "highlighting"}
              required
            />
          </InputContainer>
        ) : null}
        <ActionButton primary large type="submit">
          {creator.actionButton || "Create annotation page"}
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}

function EmptyCanvasForm({ options, runCreate }: CreatorContext) {
  const id = useId();
  return (
    <PaddedSidebarContainer>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          runCreate({
            label: { en: [String(data.get("label") || "Untitled canvas")] },
            width: Number(data.get("width")),
            height: Number(data.get("height")),
          });
        }}
      >
        <InputContainer $wide>
          <InputLabel htmlFor={`${id}-label`}>Canvas label</InputLabel>
          <Input id={`${id}-label`} name="label" defaultValue={options.initialData.label.en[0]} required />
        </InputContainer>
        <InputContainer $wide>
          <InputLabel htmlFor={`${id}-width`}>Width</InputLabel>
          <Input
            id={`${id}-width`}
            name="width"
            type="number"
            defaultValue={options.initialData.width}
            min={1}
            step={1}
            required
          />
        </InputContainer>
        <InputContainer $wide>
          <InputLabel htmlFor={`${id}-height`}>Height</InputLabel>
          <Input
            id={`${id}-height`}
            name="height"
            type="number"
            defaultValue={options.initialData.height}
            min={1}
            step={1}
            required
          />
        </InputContainer>
        <ActionButton primary large type="submit">
          Create canvas
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
