import { useAnnotationPage } from "react-iiif-vault";
import { getValue } from "@iiif/helpers";
import { isExternal } from "@/helpers/is-external";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";

interface AnnotationPagePreviewProps {
  onClick?: () => void;
  margin?: boolean;
}

export function AnnotationPagePreview({ margin, onClick }: AnnotationPagePreviewProps) {
  const page = useAnnotationPage();
  const ext = isExternal(page);

  if (!page) {
    return null;
  }

  return (
    <RichMediaLink
      margin={margin}
      title={getValue(page?.label) || <span style={{ color: "#999" }}>Untitled annotation page</span>}
      icon={ext ? <div>EXT</div> : <div>INT</div>}
      link={page?.id}
      label={ext ? "External annotations" : `${page?.items.length} annotations`}
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
  );
}
