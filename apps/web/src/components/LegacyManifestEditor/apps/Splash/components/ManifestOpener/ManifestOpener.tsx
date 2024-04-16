import { useRef, useState } from "react";
import { useProjectCreators, useProjectContext } from "@manifest-editor/projects";
import { useApps, analyse } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { InfoMessage } from "@manifest-editor/ui/madoc/components/callouts/InfoMessage";
import { InternationalString } from "@iiif/presentation-3";
import { ManifestOpenerStyles as S } from "./ManifestOpener.styles";
import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
import { Input } from "@manifest-editor/editors";
import { LocaleString } from "react-iiif-vault";
import { RightArrow } from "@manifest-editor/ui/icons/RightArrow";
import { TickIcon } from "@manifest-editor/ui/icons/TickIcon";

export function ManifestOpener() {
  const { changeApp } = useApps();
  const editProject = (project: any) => {
    if (project.resource.type === "Manifest") {
      changeApp({ id: "manifest-editor" });
    }
    if (project.resource.type === "Collection") {
      changeApp({ id: "collection-editor" });
    }
  };
  const form = useRef<HTMLFormElement>(null);
  const { createProjectFromManifestId, createProjectFromCollectionId } = useProjectCreators();
  const { current: currentProject } = useProjectContext();

  const currentProjectWarning = () => (
    <InfoMessage>
      {currentProject?.name}
      {currentProject ? (
        <Button style={{ marginLeft: 20 }} onClick={() => editProject(currentProject)}>
          Continue editing
        </Button>
      ) : null}
    </InfoMessage>
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [chosen, setChoice] = useState<{ id: string; type: "Manifest"; label: InternationalString } | null>(null);

  async function loadChosen() {
    if (chosen) {
      try {
        if (chosen.type === "Manifest") {
          await createProjectFromManifestId(chosen.id);
        } else {
          await createProjectFromCollectionId(chosen.id);
        }
      } catch (e) {
        setLoading(false);
        setSuccess(false);
        setChoice(null);
        setError(`Unknown problem with manifest`);
        return;
      }
    }
  }

  async function checkManifest() {
    setError("");
    setChoice(null);
    const f = new FormData(form.current as any);
    const data = Object.fromEntries(f.entries()) as { manifest: string };
    if (data.manifest) {
      setLoading(true);

      const result = await analyse(data.manifest);

      if (!result) {
        setLoading(false);
        setError("Unknown manifest");
        return;
      }
      if ((result.type !== "Manifest" && result.type !== "Collection") || !result.id) {
        setLoading(false);
        setError(`Expected manifest, got ${result.type}`);
        return;
      }

      setChoice(result);
      setLoading(false);
      setSuccess(true);
    }
  }

  return (
    <>
      {currentProject ? currentProjectWarning() : null}
      <S.Container>
        <S.LogoContainer>
          <ManifestEditorLogo width="100%" height="" />
        </S.LogoContainer>

        <S.InputContainer>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkManifest();
            }}
            ref={form}
          >
            <Input id="manifest" name="manifest" placeholder={"Paste manifest URL or JSON"} onBlur={checkManifest} />
          </form>
        </S.InputContainer>
        <S.LoadingContainer>
          {error ? (
            <S.ErrorBox>{error}</S.ErrorBox>
          ) : loading ? (
            <S.LoadingBox $loading={true}>
              <div className="TODO-spinner" /> Loading
            </S.LoadingBox>
          ) : success && chosen ? (
            <>
              <S.LoadingBox>
                <TickIcon /> Valid {chosen.type} (<LocaleString as="strong">{chosen.label}</LocaleString>)
              </S.LoadingBox>
              <S.OpenManifest>
                <Button onClick={loadChosen}>
                  Open {chosen.type} <RightArrow />
                </Button>
              </S.OpenManifest>
            </>
          ) : (
            <S.LearnMore onClick={() => changeApp({ id: "about" })}>
              Learn more about the Manifest Editor <RightArrow />
            </S.LearnMore>
          )}
        </S.LoadingContainer>
      </S.Container>
    </>
  );
}
