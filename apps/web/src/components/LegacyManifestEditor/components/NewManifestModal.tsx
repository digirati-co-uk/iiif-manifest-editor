import { useProjectCreators, useProjectContext } from "@manifest-editor/projects";
import { useConfig, useApps } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { InfoMessage } from "@manifest-editor/ui/madoc/components/callouts/InfoMessage";
import { NewTemplates } from "./NewTemplates";

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
      <div className="block h-48 " />
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
