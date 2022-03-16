import { useContext } from "react";
import ShellContext from "../Shell/ShellContext";
import { Button } from "../../atoms/Button";

export const RecentFiles: React.FC = () => {
  const shellContext = useContext(ShellContext);

  const handleClick = async (id: string) => {
    shellContext?.changeResourceID(id);
    shellContext?.changeSelectedApplication("ManifestEditor");
  };

  return (
    <>
      <h4>Recent manifests: </h4>
      <div>
        {shellContext?.recentManifests.map((id) => {
          return (
            <Button onClick={() => handleClick(id)}>
              <li>{id}</li>
            </Button>
          );
        })}
      </div>
    </>
  );
};

// Trigger unsaved chnages on any change.
