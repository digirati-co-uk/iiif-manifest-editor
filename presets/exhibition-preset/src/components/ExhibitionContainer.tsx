import { useLayoutActions } from "@manifest-editor/shell";
import { Button } from "react-aria-components";
import { LocaleString, useManifest } from "react-iiif-vault";

export function ExhibitionContainer({ children }: { children: React.ReactNode }) {
  const manifest = useManifest();
  const { edit } = useLayoutActions();
  return (
    <div className="grid auto-rows-auto grid-cols-12 content-center justify-center gap-2 p-2">
      <div className="col-span-12 row-span-2 text-black flex flex-col items-center justify-center">
        <Button
          onPress={() => manifest && edit(manifest)}
          className="col-span-4 row-span-4 text-md text-left text-black hover:bg-slate-100 w-full flex items-center justify-center"
        >
          <LocaleString className="block w-full text-left">{manifest?.label}</LocaleString>
        </Button>
      </div>
      {children}
    </div>
  );
}
