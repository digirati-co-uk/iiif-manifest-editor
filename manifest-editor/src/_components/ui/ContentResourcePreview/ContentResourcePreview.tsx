import { ThumbnailImg } from "@/atoms/Thumbnail";
import { ThumbnailContainer } from "@/atoms/ThumbnailContainer";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { useContentResourceThumbnail } from "@/hooks/use-content-resource-thumbnail";
import { useContentResource } from "@/hooks/useContentResource";
import { getValue } from "@iiif/vault-helpers/i18n";
import invariant from "tiny-invariant";

export function ContentResourcePreview({ id, onClick }: { id: string; onClick?: () => void }) {
  const resource = useContentResource({ id: id });
  const thumbnail = useContentResourceThumbnail({ resourceId: id });

  invariant(resource, "Resource not found");

  const label = getValue((resource as any).label, { defaultText: "Thumbnail" });

  // Image
  // Text
  // Video
  // Audio
  // HTML/Link
  // Annotation page
  // Dataset

  return (
    <div>
      <RichMediaLink
        title={label}
        icon={
          thumbnail ? (
            <ThumbnailContainer size={40}>
              <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
            </ThumbnailContainer>
          ) : null
        }
        link={id}
        label={(resource as any)?.format || resource?.type}
        iconLabel="Icon label"
        onClick={
          onClick
            ? (e) => {
                e.preventDefault();
                onClick();
              }
            : undefined
        }
      />
    </div>
  );
}
