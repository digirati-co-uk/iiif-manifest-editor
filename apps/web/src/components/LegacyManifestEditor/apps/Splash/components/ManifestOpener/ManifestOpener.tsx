import { useTranslations } from "@manifest-editor/i18n";
import { useRef, useState } from "react";
import { useProjectCreators, useProjectContext } from "@manifest-editor/projects";
import { useApps, analyse } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { InfoMessage } from "@manifest-editor/ui/madoc/components/callouts/InfoMessage";
import { InternationalString } from "@iiif/presentation-3";
import { ManifestOpenerStyles as S } from "./ManifestOpener.styles";
import { ManifestEditorLogo } from "@manifest-editor/components";
import { Input } from "@manifest-editor/editors";
import { LocaleString } from "react-iiif-vault";
import { RightArrow } from "@manifest-editor/ui/icons/RightArrow";
import { TickIcon } from "@manifest-editor/ui/icons/TickIcon";

export function ManifestOpener() {
  const webT = useTranslations("web");

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
          {webT("legacy.continue")}
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
        setError("legacy.openFailed");
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

      let result;
      try {
        result = await analyse(data.manifest);
      } catch {
        setLoading(false);
        setError("legacy.openFailed");
        return;
      }

      if (!result) {
        setLoading(false);
        setError("legacy.openFailed");
        return;
      }
      if ((result.type !== "Manifest" && result.type !== "Collection") || !result.id) {
        setLoading(false);
        setError("import.invalidType");
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
          <ManifestEditorLogo />
        </S.LogoContainer>

        <S.InputContainer>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkManifest();
            }}
            ref={form}
          >
            <Input
              id="manifest"
              name="manifest"
              placeholder={webT("legacy.paste")}
              aria-label={webT("legacy.paste")}
              onBlur={checkManifest}
            />
          </form>
        </S.InputContainer>
        <S.LoadingContainer>
          {error ? (
            <S.ErrorBox>{webT(error)}</S.ErrorBox>
          ) : loading ? (
            <S.LoadingBox $loading={true}>
              <div className="TODO-spinner" /> {webT("feedback.loadingShort")}
            </S.LoadingBox>
          ) : success && chosen ? (
            <>
              <S.LoadingBox>
                <TickIcon /> {webT(chosen.type === "Manifest" ? "legacy.validManifest" : "legacy.validCollection")} (
                <LocaleString as="strong">{chosen.label}</LocaleString>)
              </S.LoadingBox>
              <S.OpenManifest>
                <Button onClick={loadChosen}>
                  {webT(chosen.type === "Manifest" ? "browser.openManifest" : "legacy.openCollection")} <RightArrow />
                </Button>
              </S.OpenManifest>
            </>
          ) : (
            <S.LearnMore onClick={() => changeApp({ id: "about" })}>
              {webT("legacy.learnMore")}
              <RightArrow />
            </S.LearnMore>
          )}
        </S.LoadingContainer>
      </S.Container>
    </>
  );
}
