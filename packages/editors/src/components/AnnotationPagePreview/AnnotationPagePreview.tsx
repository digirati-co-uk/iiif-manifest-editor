import { getValue } from "@iiif/helpers";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";
import { useAnnotationPage } from "react-iiif-vault";
import { isExternal } from "../../helpers";

interface AnnotationPagePreviewProps {
  onClick?: () => void;
  margin?: boolean;
}

export function AnnotationPagePreview({
  margin,
  onClick,
}: AnnotationPagePreviewProps) {
  const page = useAnnotationPage();
  const ext = isExternal(page);

  if (!page) {
    return null;
  }

  return (
    <RichMediaLink
      margin={margin}
      title={
        getValue(page?.label) || (
          <span style={{ color: "#999" }}>Untitled annotation page</span>
        )
      }
      icon={
        ext ? (
          <ExternalIcon className="text-2xl" />
        ) : (
          <InternalIcon className="text-2xl" />
        )
      }
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

function ExternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="m12.126 8.125l1.937-1.937l3.747 3.747l-1.937 1.938zM20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75L20.71 7a1 1 0 0 0 0-1.37M2 5l6.63 6.63L3 17.25V21h3.75l5.63-5.62L18 21l2-2L4 3z"
      />
    </svg>
  );
}

function InternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
      />
    </svg>
  );
}
