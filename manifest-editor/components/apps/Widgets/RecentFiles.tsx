import { useContext } from "react";
import ShellContext from "../Shell/ShellContext";

export const RecentFiles: React.FC = () => {
  const shellContext = useContext(ShellContext);
  // Build on this just showing a list for now but we want this to be interactive, thumbnails perhaps?
  return (
    <>
      <h4>Recent manifests: </h4>
      <ul>
        {shellContext?.recentManifests.map((id) => {
          return <li>{id}</li>;
        })}
      </ul>
    </>
  );
};
