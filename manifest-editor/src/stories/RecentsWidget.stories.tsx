import * as React from "react";
import { RecentFiles } from "../components/widgets/RecentFiles";
import { recentManifests } from "./storiesData/recent-manifests";

export default {
  title: "Widgets/Recents",
  component: RecentFiles,
  args: {
    recentManifests: recentManifests,
    changeManifest: (id: string) => alert(`You clicked on ${id}`),
  },
};

const Template = (props: any) => <RecentFiles {...props} />;

export const RecentManifestsExample = Template.bind({});
