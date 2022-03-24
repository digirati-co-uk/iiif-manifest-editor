import { useManifest } from "react-iiif-vault";
import { JSONPreview } from "../../atoms/JSONPreview";
import { ShadowContainer } from "../../atoms/ShadowContainer";
import { SmallThumbnailStrip } from "../../organisms/ThumbnailStrip";

export const StructuralForm = () => {
  const manifest = useManifest();

  return (
    <>
      <ShadowContainer>
        <h3>items</h3>
        <SmallThumbnailStrip />
      </ShadowContainer>
      <ShadowContainer>
        <h3>annotations</h3>
        <JSONPreview>
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifest?.annotations, null, 2),
            }}
          />
        </JSONPreview>
      </ShadowContainer>
      <ShadowContainer>
        <h3>partOf</h3>
        <JSONPreview>
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifest?.partOf, null, 2),
            }}
          />
        </JSONPreview>
      </ShadowContainer>
      <ShadowContainer>
        <h3>start</h3>
        <JSONPreview>
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifest?.start, null, 2),
            }}
          />
        </JSONPreview>
      </ShadowContainer>
      <ShadowContainer>
        <h3>structures</h3>
        <JSONPreview>
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifest?.structures, null, 2),
            }}
          />
        </JSONPreview>
      </ShadowContainer>
    </>
  );
};
