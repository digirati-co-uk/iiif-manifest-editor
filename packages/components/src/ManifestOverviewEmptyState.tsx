import { Button } from "react-aria-components";
import { Card3D } from "./Card3D";

export function ManifestOverviewEmptyState({ onCreate, canCreate }: { onCreate: () => void; canCreate: boolean }) {
  return (
    <div className="flex items-center flex-col gap-5 py-16">
      <Card3D
        shouldTranslate
        onClick={canCreate ? onCreate : undefined}
        className="border-2 border-dotted bg-black/5 aspect-[3/4] rounded w-32 border-black"
      />
      <div className="max-w-xl px-5">
        Add a title and top level information for this manifest using the editing panel, and then add some canvases and
        content.
      </div>
      {canCreate ? (
        <Button
          className="px-8 font-bold py-2 border rounded-lg border-me-primary-500 text-me-primary-500 hover:border-me-primary-600 hover:text-me-primary-600"
          onPress={onCreate}
        >
          Start adding content
        </Button>
      ) : null}
    </div>
  );
}
