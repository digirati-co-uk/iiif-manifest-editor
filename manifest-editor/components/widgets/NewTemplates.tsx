import { IIIFBuilder } from "iiif-builder";
import { ManifestNormalized } from "@iiif/presentation-3";
import { ThumbnailImg } from "../atoms/Thumbnail";
import {
  RecentFilesWidget,
  RecentLabel,
  RecentManifestCard,
  RecentThumbnails,
} from "../atoms/RecentFilesWidget";
import { useManifest } from "../../hooks/useManifest";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { ManifestContext } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";

type NewTemplates = {
  newTemplates: any[] | undefined;
  changeManifest: (id: string) => void;
};

const TemplateCard: React.FC<{}> = () => {
  const manifest = useManifest();
  return (
    <FlexContainerColumn style={{ alignItems: "center", cursor: "grab" }}>
      {getValue(manifest?.label)}
    </FlexContainerColumn>
  );
};

export const NewTemplates: React.FC<NewTemplates> = ({
  newTemplates,
  changeManifest,
}) => {
  const builder = new IIIFBuilder();
  return (
    <RecentFilesWidget>
      <h4>Start from template </h4>
      <RecentThumbnails>
        {newTemplates &&
          // @ts-ignore
          newTemplates?.items.map((manifest) => {
            console.log(window.location.href + manifest.id);
            return (
              <>
                <ManifestContext
                  manifest={window.location.href + manifest.id}
                  key={manifest.id}
                >
                  <TemplateCard></TemplateCard>
                </ManifestContext>
                <RecentLabel
                  onClick={() =>
                    changeManifest(window.location.href + manifest.id)
                  }
                >
                  {window.location.href + manifest.id}
                </RecentLabel>
              </>
            );
          })}
      </RecentThumbnails>
    </RecentFilesWidget>
  );
};
