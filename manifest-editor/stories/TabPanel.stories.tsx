import * as React from "react";
import { TabPanel } from "../components/layout/TabPanel";

export default { title: "Layout/Tab Panel" };

export const Tab_Panel = () => {
  const [selected, setSelected] = React.useState(0);
  return (
    <TabPanel
      menu={[
        {
          label: "Descriptive",
          component: <div>I will be the descriptive panel</div>,
        },
        {
          label: "Metadata",
          component: <div>I will be the metadata panel</div>,
        },
        {
          label: "Linking",
          component: <div>I will be the linking panel</div>,
        },
        {
          label: "Technical",
          component: <div>I will be the technical panel</div>,
        },
        {
          label: "Structural",
          component: <div>I will be the structural panel</div>,
        },
        {
          label: "Annotations",
          component: <div>I will be the annotations panel</div>,
        },
      ]}
      switchPanel={(idx: number) => setSelected(idx)}
      selected={selected}
    />
  );
};
