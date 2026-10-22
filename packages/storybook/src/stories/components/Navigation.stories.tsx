import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AddIcon,
  GridIcon,
  InfoIcon,
  PanelSideMenu,
  SidebarTabs,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@manifest-editor/components";
import { useId, useState } from "react";
import { StoryFrame } from "../../support/StoryFrame";

const panels = [
  { id: "description", label: "Description", text: "Labels, summaries and descriptive metadata belong in this panel." },
  { id: "technical", label: "Technical", text: "Dimensions, duration and behavior settings belong in this panel." },
  { id: "linking", label: "Linking", text: "Related resources, homepages and services belong in this panel." },
  { id: "structure", label: "Structure", text: "Canvases, ranges and annotation pages belong in this panel." },
];

function Navigation({
  mode = "tabs",
  width = 560,
  vertical = false,
}: {
  mode?: "tabs" | "sidebar" | "panels";
  width?: number;
  vertical?: boolean;
}) {
  const [selected, setSelected] = useState("description");
  const id = useId();
  return (
    <StoryFrame
      title="Navigation"
      summary="Select a panel using the editor's accessible navigation primitives. Tab lists also support arrow keys."
      onReset={() => setSelected("description")}
    >
      <div className="sb-pane" style={{ width: "100%", maxWidth: width, minHeight: 260 }}>
        {mode === "sidebar" ? (
          <SidebarTabs
            menuId={id}
            selectedKey={selected}
            onSelectionChange={setSelected}
            menu={panels.map((p) => ({ ...p, renderComponent: () => <p className="p-4">{p.text}</p> }))}
          />
        ) : mode === "panels" ? (
          <div style={{ display: "flex", height: 240, gap: 16 }}>
            <PanelSideMenu
              current={selected}
              open
              items={panels.slice(0, 3).map((p, i) => ({
                ...p,
                icon: [<InfoIcon key="info" />, <GridIcon key="grid" />, <AddIcon key="add" />][i],
                onClick: () => setSelected(p.id),
              }))}
            />
            <p>{panels.find((p) => p.id === selected)?.text}</p>
          </div>
        ) : (
          <Tabs
            aria-label="Resource properties"
            orientation={vertical ? "vertical" : "horizontal"}
            selectedKey={selected}
            onSelectionChange={(key) => setSelected(String(key))}
            style={vertical ? { display: "flex", gap: 24 } : undefined}
          >
            <TabList aria-label="Property groups" style={vertical ? { flexDirection: "column" } : undefined}>
              {panels.map((p) => (
                <Tab key={p.id} id={p.id}>
                  {p.label}
                </Tab>
              ))}
            </TabList>
            {panels.map((p) => (
              <TabPanel key={p.id} id={p.id}>
                <p className="p-4">{p.text}</p>
              </TabPanel>
            ))}
          </Tabs>
        )}
      </div>
      <output>Selected panel: {selected}</output>
    </StoryFrame>
  );
}

const meta = {
  title: "Components/Navigation",
  component: Navigation,
  args: { mode: "tabs", width: 560, vertical: false },
  argTypes: {
    mode: { control: "select", options: ["tabs", "sidebar", "panels"] },
    width: { control: { type: "range", min: 180, max: 800, step: 20 } },
  },
} satisfies Meta<typeof Navigation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TabsSelection: Story = {};
export const VerticalTabs: Story = { args: { vertical: true } };
export const SidebarTabSelection: Story = { args: { mode: "sidebar" } };
export const SidebarOverflow: Story = { args: { mode: "sidebar", width: 240 } };
export const PanelNavigation: Story = { args: { mode: "panels" } };
