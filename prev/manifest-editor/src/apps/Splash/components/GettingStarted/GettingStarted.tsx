import { FeaturedCard } from "@/apps/Splash/components/FeaturedCard/FeaturedCard";
import blankManifest from "@/apps/Splash/images/blank-manifest.svg";
import { FeaturedCardImageWrapper } from "@/apps/Splash/components/FeaturedCard/FeaturedCard.styles";
import { FlexContainer } from "@/components/layout/FlexContainer";
import { useProjectCreators } from "@/shell/ProjectContext/ProjectContext.hooks";

export interface GettingStartedProps {
  exampleId?: string;
  exampleThumbnail?: string;
}

export function GettingStarted(props: GettingStartedProps) {
  const { createBlankManifest, createProjectFromManifestId } = useProjectCreators();

  return (
    <FlexContainer>
      <FeaturedCard
        label="Create empty manifest"
        onClick={createBlankManifest}
        thumbnail={<img src={blankManifest} alt="" />}
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
    </FlexContainer>
  );
}
