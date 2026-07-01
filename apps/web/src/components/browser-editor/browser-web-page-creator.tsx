import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { defineCreator } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
import Image from "next/image";
import { type ClipboardEvent, useEffect, useState } from "react";

interface CreateBrowserWebPagePayload {
  url: string;
  label?: InternationalString;
  summary?: InternationalString;
  thumbnail?: string;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
}

interface WebPagePreview {
  title?: string;
  description?: string;
  image?: string;
}

export const browserWebPageCreator = defineCreator({
  id: "@manifest-editor/web-page-creator",
  create: createBrowserWebPage,
  label: "Web page",
  summary: "Add link to an external web page",
  icon: <LinkIcon />,
  render(ctx) {
    return <CreateBrowserWebPageForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
});

async function createBrowserWebPage(data: CreateBrowserWebPagePayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: data.url,
    type: "Text",
    label: data.label,
    summary: data.summary,
    format: "text/html",
    thumbnail: data.thumbnail
      ? [
          {
            id: data.thumbnail,
            type: "Image",
            height: data.thumbnailHeight || 100,
            width: data.thumbnailWidth || 100,
          },
        ]
      : undefined,
  });
}

function CreateBrowserWebPageForm(props: CreatorContext) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState<InternationalString>({ en: [""] });
  const [summary, setSummary] = useState<InternationalString>({ en: [""] });
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailSize, setThumbnailSize] = useState({ height: 0, width: 0 });
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailSize({ height: 0, width: 0 });
      return;
    }

    const image = new window.Image();
    const setSize = () => {
      setThumbnailSize({
        height: image.naturalHeight,
        width: image.naturalWidth,
      });
    };
    image.onload = setSize;
    image.src = thumbnail;

    if (image.complete && image.naturalWidth) {
      setSize();
    }
  }, [thumbnail]);

  const createLink = () => {
    if (url) {
      props.runCreate({
        url,
        label,
        summary,
        thumbnail: thumbnail || undefined,
        thumbnailHeight: thumbnailSize.height || undefined,
        thumbnailWidth: thumbnailSize.width || undefined,
      });
    }
  };

  const onPasteUrl = async (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData("text").trim();
    if (!pastedUrl) return;

    e.preventDefault();
    setUrl(pastedUrl);
    setError("");
    setManual(false);

    setLoadingPreview(true);
    try {
      const preview = (await fetch("/api/web-page-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: pastedUrl }),
      }).then((r) => (r.ok ? r.json() : null))) as WebPagePreview | null;

      if (!preview) {
        setError("Could not fetch a preview for this URL.");
        setManual(true);
        return;
      }

      setLabel({ en: [preview.title || pastedUrl] });
      if (preview?.description) setSummary({ en: [preview.description] });
      setThumbnail(preview.image || "");
    } catch {
      setError("Could not fetch a preview for this URL.");
      setManual(true);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <PaddedSidebarContainer>
      <div className="flex flex-col gap-3">
        <InputContainer $wide>
          <InputLabel htmlFor="url">Link</InputLabel>
          <Input id="url" name="url" value={url} onChange={(e) => setUrl(e.target.value)} onPaste={onPasteUrl} />
        </InputContainer>

        {loadingPreview ? <div className="text-sm text-gray-500">Fetching preview...</div> : null}
        {error ? <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}

        {url && !manual && !loadingPreview && (label.en?.[0] || summary.en?.[0] || thumbnail) ? (
          <div className="relative overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm shadow"
              aria-label="Close preview"
              onClick={() => setManual(true)}
            >
              X
            </button>
            <div className="flex gap-3 p-3">
              {thumbnail ? (
                <Image
                  unoptimized
                  className="h-24 w-24 shrink-0 rounded object-cover"
                  src={thumbnail}
                  alt=""
                  width={96}
                  height={96}
                />
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-1 pr-7">
                <div className="break-words text-sm font-semibold">{label.en?.[0] || url}</div>
                {summary.en?.[0] ? <div className="line-clamp-3 text-sm text-gray-600">{summary.en[0]}</div> : null}
                <div className="truncate text-xs text-gray-400">{url}</div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-3">
              <ActionButton primary large type="button" onPress={createLink}>
                Add link
              </ActionButton>
            </div>
          </div>
        ) : null}

        {manual ? (
          <>
            <LanguageFieldEditor
              focusId="label"
              label="Label"
              fields={label}
              onSave={(e: any) => setLabel(e.toInternationalString())}
            />

            <LanguageFieldEditor
              focusId="summary"
              label="Description"
              fields={summary}
              onSave={(e: any) => setSummary(e.toInternationalString())}
            />

            {thumbnail ? (
              <InputContainer $wide>
                <InputLabel>Thumbnail</InputLabel>
                <Image
                  unoptimized
                  className="mb-2 max-h-32 max-w-full object-contain"
                  src={thumbnail}
                  alt=""
                  width={256}
                  height={128}
                />
                <ActionButton
                  type="button"
                  onPress={() => {
                    setThumbnail("");
                    setThumbnailSize({ height: 0, width: 0 });
                  }}
                >
                  Remove thumbnail
                </ActionButton>
              </InputContainer>
            ) : null}

            <ActionButton primary large type="button" onPress={createLink}>
              Add link
            </ActionButton>
          </>
        ) : null}
      </div>
    </PaddedSidebarContainer>
  );
}
