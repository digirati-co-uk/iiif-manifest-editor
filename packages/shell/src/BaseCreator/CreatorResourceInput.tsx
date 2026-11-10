import { useTranslations } from "@manifest-editor/i18n";
import {
  ActionButton,
  AddImageIcon,
  IIIFBrowserIcon,
  IIIFLogo,
  VideoIcon,
  YouTubeIcon,
} from "@manifest-editor/components";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
import { type ReactNode, type RefObject, useEffect, useState } from "react";

export interface CreatorResourceInputProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  isChecking: boolean;
  rotateExamples?: boolean;
  onBrowse?: () => void;
}

const STATIC_PLACEHOLDER = "https://example.org/manifest.json";
const ROTATE_MS = 2000;

interface Example {
  icon: ReactNode;
  text: string;
}

const EXAMPLES: Example[] = [
  { icon: <IIIFLogo />, text: "https://example.org/iiif/manifest.json" },
  { icon: <AddImageIcon />, text: "https://example.org/photo.jpg" },
  { icon: <VideoIcon />, text: "https://example.org/video.mp4" },
  { icon: <YouTubeIcon />, text: "https://www.youtube.com/watch?v=…" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}

export function CreatorResourceInput({
  value,
  onChange,
  inputRef,
  isChecking,
  rotateExamples = true,
  onBrowse,
}: CreatorResourceInputProps) {
  const t = useTranslations("shell");

  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const animating = rotateExamples && !reduced && !value && !isChecking;

  useEffect(() => {
    if (!animating) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % EXAMPLES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [animating]);

  const example = EXAMPLES[index]!;

  return (
    <div>
      <style>{`
        @keyframes creator-resource-hint-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .creator-resource-hint { animation: creator-resource-hint-in 180ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .creator-resource-hint { animation: none; } }
      `}</style>
      <label className="block text-sm font-medium text-gray-700" htmlFor="creator-resource-link">
        {t("creator.paste")}
      </label>
      <div className="mt-1 flex min-h-12 w-full items-center rounded-md border border-gray-300 bg-white p-1 focus-within:border-me-primary-500 focus-within:ring-2 focus-within:ring-me-primary-500">
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id="creator-resource-link"
            type="url"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={animating ? "" : rotateExamples ? STATIC_PLACEHOLDER : "https://example.org/resource"}
            className="block h-10 w-full min-w-0 border-none bg-transparent pl-9 pr-2 text-sm outline-none focus:outline-none"
          />
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 [&>svg]:h-4 [&>svg]:w-4"
            aria-hidden="true"
          >
            {animating ? example.icon : <LinkIcon />}
          </span>
          {animating ? (
            <span
              key={index}
              aria-hidden="true"
              className="creator-resource-hint pointer-events-none absolute inset-y-0 left-9 right-3 flex items-center overflow-hidden"
            >
              <span className="truncate text-sm text-gray-400">{example.text}</span>
            </span>
          ) : null}
        </div>
        {onBrowse ? (
          <button
            type="button"
            aria-label={t("creator.browse")}
            title={t("creator.browse")}
            disabled={isChecking}
            onClick={onBrowse}
            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-transparent text-gray-500 hover:bg-gray-100 hover:text-me-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-me-primary-500 disabled:opacity-50"
          >
            <IIIFBrowserIcon className="h-5 w-5" />
          </button>
        ) : null}
        <ActionButton
          primary
          type="submit"
          isDisabled={!value.trim() || isChecking}
          className="h-9 shrink-0 justify-center px-3"
        >
          {isChecking ? t("creator.checkingShort") : t("creator.useLink")}
        </ActionButton>
      </div>
    </div>
  );
}
