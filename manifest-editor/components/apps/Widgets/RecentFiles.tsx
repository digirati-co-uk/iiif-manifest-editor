import { useContext } from "react";
import ShellContext from "../Shell/ShellContext";
import { useVault } from "react-iiif-vault";
import { Button } from "../../atoms/Button";

export const RecentFiles: React.FC = () => {
  const shellContext = useContext(ShellContext);
  const vault = useVault();
  // Build on this just showing a list for now but we want this to be interactive, thumbnails perhaps?

  const handleClick = async (id: string) => {
    await vault.load(id);
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
