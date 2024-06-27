import { useProjectCreators } from "@manifest-editor/projects";
import { FeaturedCard } from "../FeaturedCard/FeaturedCard";
import { FeaturedCardImageWrapper } from "../FeaturedCard/FeaturedCard.styles";

export interface GettingStartedProps {
  exampleId?: string;
  exampleThumbnail?: string;
}

export function GettingStarted(props: GettingStartedProps) {
  const { createBlankManifest, createProjectFromManifestId } = useProjectCreators();

  return (
    <div className="flex">
      <FeaturedCard
        label="Create empty manifest"
        onClick={createBlankManifest}
        thumbnail={
          <svg width="154" height="154" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <defs>
              <circle id="a" cx="77" cy="77" r="77" />
            </defs>
            <g fill="none" fillRule="evenodd">
              <mask id="b" fill="#fff">
                <use xlinkHref="#a" />
              </mask>
              <use fill="#A4B2CB" xlinkHref="#a" />
              <g mask="url(#b)" fill="#D5DDEB">
                <g transform="translate(-6 -27)">
                  <rect x="46" y="118" width="33" height="41" rx="5" />
                  <rect x="89" y="82" width="33" height="41" rx="5" />
                  <rect x="91" y="135" width="33" height="41" rx="5" />
                  <rect x="50" y="168" width="33" height="41" rx="5" />
                  <rect x="5" y="94" width="33" height="41" rx="5" />
                  <rect x="133" y="155" width="33" height="41" rx="5" />
                  <rect x="134" y="102" width="33" height="41" rx="5" />
                  <rect x="133" y="50" width="33" height="41" rx="5" />
                  <rect x="134" width="33" height="41" rx="5" />
                  <rect x="89" y="29" width="33" height="41" rx="5" />
                  <rect x="5" y="41" width="33" height="41" rx="5" />
                  <rect y="149" width="33" height="41" rx="5" />
                  <rect x="46" y="65" width="33" height="41" rx="5" />
                  <rect x="45" y="12" width="33" height="41" rx="5" />
                </g>
              </g>
            </g>
          </svg>
        }
        actionLabel="Create"
      />
      <FeaturedCard
        label="Example manifest"
        onClick={() => createProjectFromManifestId(props.exampleId || "https://digirati-co-uk.github.io/wunder.json")}
        thumbnail={
          <FeaturedCardImageWrapper>
            <img
              src={
                props.exampleThumbnail ||
                "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/145,200/0/default.jpg"
              }
              alt=""
            />
          </FeaturedCardImageWrapper>
        }
        actionLabel="Open manifest"
      />
    </div>
  );
}
