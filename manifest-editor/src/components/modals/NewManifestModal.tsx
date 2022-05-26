import { NewTemplates } from "../widgets/NewTemplates";
import { useProjectCreators } from "../../shell/ProjectContext/ProjectContext.hooks";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";

export const NewManifestModal: React.FC<{
  close: any;
}> = ({ close }) => {
  const { newTemplates } = useConfig();
  const { createProjectFromManifestId } = useProjectCreators();

  return (
    <NewTemplates
      changeManifest={(id: string) => {
        createProjectFromManifestId(id).then(() => {
          close();
        });
      }}
      newTemplates={newTemplates as any}
    />
  );
};
