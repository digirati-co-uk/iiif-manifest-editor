import { IIIFBuilder } from "iiif-builder";
import { ManifestNormalized } from "@iiif/presentation-3";
import { ThumbnailImg } from "../atoms/Thumbnail";
import {
  RecentFilesWidget,
  RecentLabel,
  RecentManifestCard,
  RecentThumbnails,
} from "../atoms/RecentFilesWidget";

type RecentFiles = {
  recentManifests: ManifestNormalized[] | undefined;
  changeManifest: (id: string) => void;
};

export const RecentFiles: React.FC<RecentFiles> = ({
  recentManifests,
  changeManifest,
}) => {
  const builder = new IIIFBuilder();

  const IIIFCollection = builder.createCollection(
    "https://example.com/recent-manifests",
    (collection) => {
      collection.addLabel("Recently Used Manifests", "none");
      if (recentManifests)
        recentManifests.map((recent) => {
          collection.createManifest(recent.id, (manifest) => {
            manifest.addLabel(recent.id);
            // @ts-ignore
            if (recent && recent.thumbnail && recent.thumbnail[0]) {
              manifest.addThumbnail({
                id: recent.thumbnail[0].id,
                type: "Image",
                format: "image/jpg",
              });
            }
          });
        });
    }
  );
  return (
    <RecentFilesWidget>
      <h4>Open Recent </h4>
      <RecentThumbnails>
        {IIIFCollection.items.map((manifest) => {
          return (
            <RecentManifestCard>
              <ThumbnailImg
                // @ts-ignore
                src={
                  manifest &&
                  // @ts-ignore
                  manifest?.thumbnail &&
                  // @ts-ignore
                  manifest?.thumbnail[0] &&
                  // @ts-ignore
                  manifest?.thumbnail[0].id
                    ? // @ts-ignore
                      manifest?.thumbnail[0].id
                    : ""
                }
                alt={manifest.id}
                loading="lazy"
                onClick={() => changeManifest(manifest.id)}
                title={manifest.id}
              />
              <RecentLabel>{manifest.id}</RecentLabel>
            </RecentManifestCard>
          );
        })}
      </RecentThumbnails>
    </RecentFilesWidget>
  );
};
