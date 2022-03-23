import { useContext } from "react";
import { LanguageMapInput } from "../LanguageMapInput";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { SingleValueInput } from "../SingleValueInput";
import ShellContext from "../../apps/Shell/ShellContext";
import { useManifest, useVault } from "react-iiif-vault";
import { JSONPreview } from "../../atoms/JSONPreview";
import { ShadowContainer } from "../../atoms/ShadowContainer";
import { SmallThumbnailStrip } from "../../organisms/ThumbnailStrip";

export const StructuralForm = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();

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
