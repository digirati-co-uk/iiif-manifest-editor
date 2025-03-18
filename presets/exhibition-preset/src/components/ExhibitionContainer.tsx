import { useLayoutActions } from "@manifest-editor/shell";
import { Button } from "react-aria-components";
import { LocaleString, useManifest } from "react-iiif-vault";

export function ExhibitionContainer({
  children,
}: { children: React.ReactNode }) {
  const manifest = useManifest();
  const { edit } = useLayoutActions();
  return (
    <div className="grid auto-rows-auto grid-cols-12 content-center justify-center gap-2 p-2">
      <div className="col-span-4 row-span-4 text-black min-h-[100px] flex items-center justify-center">
        <Button
          onPress={() => manifest && edit(manifest)}
          className="col-span-4 row-span-4 text-xs text-black bg-[rgb(250,204,21)] min-h-[100px] w-full flex items-center justify-center"
        >
          <LocaleString enableDangerouslySetInnerHTML>{manifest?.label}</LocaleString>
        </Button>
      </div>
      {children}
    </div>
  );
}
