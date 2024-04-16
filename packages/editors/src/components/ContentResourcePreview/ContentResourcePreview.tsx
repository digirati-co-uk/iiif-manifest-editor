import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { ThumbnailContainer } from "@manifest-editor/ui/atoms/ThumbnailContainer";
import { getValue } from "@iiif/helpers/i18n";
import invariant from "tiny-invariant";
import { useContentResource } from "../../hooks/useContentResource";
import { useContentResourceThumbnail } from "../../hooks/useContentResourceThumbnailHelper";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";

export function ContentResourcePreview({
  id,
  onClick,
  margin,
}: {
  id: string;
  onClick?: () => void;
  margin?: boolean;
}) {
  const resource = useContentResource({ id: id });
  const thumbnail = useContentResourceThumbnail({ resourceId: id });

  invariant(resource, `ContentResource "${id}" not found`);

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
        margin={margin}
        title={label}
        icon={
          thumbnail ? (
            <ThumbnailContainer $size={40}>
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
