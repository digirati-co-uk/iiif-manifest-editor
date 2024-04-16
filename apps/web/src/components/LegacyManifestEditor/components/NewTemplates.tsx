import { useEffect, useState } from "react";
import {
  TemplateCardContainer,
  TemplateCardNew,
  TemplateCardPlaceholder,
} from "@manifest-editor/ui/atoms/TemplateCard";
import { AddIcon } from "@manifest-editor/ui/icons/AddIcon";
import { Vault, getValue } from "@iiif/helpers";
import { RecentFilesWidget, RecentLabel, RecentThumbnails } from "@manifest-editor/ui/atoms/RecentFilesWidget";
import { WidgetHeader } from "@manifest-editor/ui/atoms/WidgetHeader";

interface NewTemplatesProps {
  newTemplates: any[] | undefined;
  changeManifest(id: string): void;
}

function TemplateCard({ manifestUrl, changeManifest }: { manifestUrl: string; changeManifest: (id: string) => void }) {
  const vault = new Vault();

  const [manifest, setManifest] = useState<any>();

  useEffect(() => {
    const waitData = async () => {
      const data = await vault.loadManifest(manifestUrl || "");
      setManifest(data);
    };
    waitData();
  }, [manifestUrl]);

  return (
    <TemplateCardContainer onClick={() => changeManifest(window.location.href + manifest.id)}>
      <TemplateCardNew>
        {getValue(manifest?.label) === "Blank Manifest" ? <AddIcon /> : <TemplateCardPlaceholder />}
      </TemplateCardNew>
      <RecentLabel>{getValue(manifest?.label)}</RecentLabel>
    </TemplateCardContainer>
  );
}

export function NewTemplates({ newTemplates, changeManifest }: NewTemplatesProps) {
  return (
    <RecentFilesWidget>
      <WidgetHeader>Start from template</WidgetHeader>

      <RecentThumbnails>
        {newTemplates &&
          // @ts-ignore
          newTemplates?.items.map((manifest) => {
            return (
              <TemplateCard
                key={manifest.id}
                manifestUrl={window.location.href + manifest.id}
                changeManifest={changeManifest}
              />
            );
          })}
      </RecentThumbnails>
    </RecentFilesWidget>
  );
}
