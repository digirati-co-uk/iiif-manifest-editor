import { useThumbnail } from "react-iiif-vault";
import manifest from "../icons/manifest.svg";

export function ManifestIcon() {
  const thumbnail = useThumbnail({ width: 256, height: 256 }, false);

  if (thumbnail) {
    return <img src={thumbnail.id} alt="" />;
  }

  return <img src={manifest} alt="" />;
}
