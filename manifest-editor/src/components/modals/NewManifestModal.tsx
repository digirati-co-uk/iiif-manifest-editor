import { NewTemplates } from "../widgets/NewTemplates";
import { useProjectCreators } from "../../shell/ProjectContext/ProjectContext.hooks";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";
import { Button } from "../../atoms/Button";
import { InfoMessage } from "../../madoc/components/callouts/InfoMessage";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";
import { useApps } from "../../shell/AppContext/AppContext";
import { PaddingComponentMedium } from "../../atoms/PaddingComponent";

export const NewManifestModal: React.FC<{
  close: any;
}> = ({ close }) => {
  const { newTemplates } = useConfig();
  const { changeApp } = useApps();
  const { createProjectFromManifestId } = useProjectCreators();
  const { current: currentProject } = useProjectContext();

  return (
    <>
      <NewTemplates
        changeManifest={(id: string) => {
          createProjectFromManifestId(id).then(() => {
            close();
          });
        }}
        newTemplates={newTemplates as any}
      />
      <PaddingComponentMedium />
      {currentProject ? (
        <InfoMessage $banner>
          {currentProject.name}{" "}
          <Button style={{ marginLeft: 20 }} onClick={() => changeApp({ id: "manifest-editor" })}>
            Continue editing
          </Button>
        </InfoMessage>
      ) : null}
    </>
  );
};
