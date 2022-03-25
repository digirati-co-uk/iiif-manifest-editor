import {
  RecentFilesWidget,
  RecentLabel,
  RecentThumbnails,
} from "../atoms/RecentFilesWidget";
import { getValue } from "@iiif/vault-helpers";
import * as IIIFVault from "@iiif/vault";
import { useEffect, useState } from "react";
import {
  TemplateCardContainer,
  TemplateCardNew,
  TemplateCardPlaceholder,
} from "../atoms/TemplateCard";
import { AddIcon } from "../icons/AddIcon";

type NewTemplates = {
  newTemplates: any[] | undefined;
  changeManifest: (id: string) => void;
};

const TemplateCard: React.FC<{
  manifestUrl: string;
  changeManifest: (id: string) => void;
}> = ({ manifestUrl, changeManifest }) => {
  const vault = new IIIFVault.Vault();

  const [manifest, setManifest] = useState<any>();

  useEffect(() => {
    const waitData = async () => {
      const data = await vault.loadManifest(manifestUrl || "");
      setManifest(data);
    };
    waitData();
  }, []);
  return (
    <TemplateCardContainer
      onClick={() => changeManifest(window.location.href + manifest.id)}
    >
      <TemplateCardNew>
        {getValue(manifest?.label) === "Blank Manifest" ? (
          <AddIcon />
        ) : (
          <TemplateCardPlaceholder />
        )}
      </TemplateCardNew>
      <RecentLabel>{getValue(manifest?.label)}</RecentLabel>
    </TemplateCardContainer>
  );
};

export const NewTemplates: React.FC<NewTemplates> = ({
  newTemplates,
  changeManifest,
}) => {
  return (
    <RecentFilesWidget>
      <h4>Start from template </h4>
      <RecentThumbnails>
        {newTemplates &&
          // @ts-ignore
          newTemplates?.items.map((manifest) => {
            return (
              <>
                <TemplateCard
                  manifestUrl={window.location.href + manifest.id}
                  changeManifest={changeManifest}
                />
              </>
            );
          })}
      </RecentThumbnails>
    </RecentFilesWidget>
  );
};
