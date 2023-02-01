import { useThumbnail } from "react-iiif-vault";

export function ManifestIcon() {
  const thumbnail = useThumbnail({ width: 120, height: 120 });

  if (thumbnail) {
    return <img src={thumbnail.id} />;
  }

  return <div>NO icon</div>;
}
