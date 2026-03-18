import { useLocalStorage } from "@manifest-editor/components";
import { useMemo } from "react";
import { Button } from "react-aria-components";
import { useManifest, useVaultSelector } from "react-iiif-vault";

export function MaybeExhibitionPrompt({ id, alreadyExhibition }: { id: string; alreadyExhibition: boolean }) {
  const manifest = useManifest();
  const [isDismissed, setDismissed] = useLocalStorage(`exhibition-popup/${id}`);

  const behaviours = useVaultSelector(
    (_, v) => {
      return (v.get(manifest?.items || []) || [])
        .filter((item): item is { behavior?: string[] } => !!item)
        .slice(0, 5)
        .flatMap((item) => (Array.isArray(item.behavior) ? item.behavior : []))
        .join(" ");
    },
    [manifest],
  );
  const isExhibition = useMemo(() => {
    if (
      behaviours.includes("w-") ||
      behaviours.includes("h-") ||
      behaviours.includes("image") ||
      behaviours.includes("info")
    ) {
      return true;
    }
    return false;
  }, [behaviours]);

  if (!id) return null;

  if (isDismissed) return null;

  if (alreadyExhibition) {
    return null;
  }

  if (isExhibition) {
    return (
      <div className="flex gap-2 justify-between items-center text-sm bg-me-50 rounded p-1.5">
        <div />
        <p className="text-gray-600">
          This Manifest appears to be an Exhibition Manifest.{" "}
          <a
            className="text-me-primary-500 underline hover:underline hover:text-me-primary-600 inline-flex items-center gap-2"
            href={`/editor/${id}/exhibition`}
          >
            Open in Exhibition Editor
          </a>
        </p>
        <Button
          className="inline-flex gap-1 items-center text-me-primary-500 underline"
          onPress={() => setDismissed(true)}
        >
          Dismiss this message
        </Button>
      </div>
    );
  }

  return null;
}
