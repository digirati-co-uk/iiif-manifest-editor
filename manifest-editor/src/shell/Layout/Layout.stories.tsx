import { Layout } from "./Layout";
import { LayoutProps } from "./Layout.types";
import { LayoutProvider, useLayoutProvider } from "./Layout.context";

export default {
  title: "Shell / Layout",
  component: Layout,
  args: {
    leftPanels: [
      {
        id: "left-1",
        label: "Left 1",
        icon: null,
        render: () => <div>left panel 1</div>,
      },
      {
        id: "left-2",
        label: "Left 2",
        hideHeader: true,
        icon: null,
        render: () => <div>left panel 2</div>,
      },
    ],
    rightPanels: [
      {
        id: "right-1",
        label: "Right 1",
        pinnable: true,
        icon: null,
        render: () => <div>right panel 1</div>,
      },
      {
        id: "right-2",
        label: "Right 2",
        pinnable: true,
        icon: null,
        render: (state) => <div>right panel 2 {JSON.stringify(state)}</div>,
      },
    ],
    centerPanels: [
      {
        id: "center-1",
        label: "Center 1",
        icon: null,
        render: () => (
          <div>
            <ExampleControls />
          </div>
        ),
      },
    ],
    footer: <div>footer</div>,
    header: <h5 style={{ margin: 10 }}>Manifest editor</h5>,
  } as LayoutProps,
};

const Template = (props: LayoutProps) => (
  <LayoutProvider>
    <Layout {...props} />
  </LayoutProvider>
);

const staticSomething = { something: "something" };

function ExampleControls() {
  const { actions, state } = useLayoutProvider();

  console.log(state);

  return (
    <div style={{ height: 800, padding: 40 }}>
      <button onClick={actions.leftPanel.toggle}>toggle left</button>
      <button onClick={actions.rightPanel.toggle}>toggle right</button>
      <button onClick={actions.pinnedRightPanel.toggle}>toggle right2</button>
      <div>
        <button onClick={() => actions.leftPanel.change({ id: "left-1" })}>left 1</button>
        <button onClick={() => actions.leftPanel.change({ id: "left-2" })}>left 2</button>
      </div>
      <div>
        <button onClick={() => actions.rightPanel.change({ id: "right-1" })}>right 1</button>
        <button onClick={() => actions.rightPanel.change({ id: "right-2", state: staticSomething })}>right 2</button>
      </div>
      <div>
        <button onClick={() => actions.pinnedRightPanel.pin({ id: "right-1" })}>pin right 1</button>
        <button onClick={() => actions.pinnedRightPanel.pin({ id: "right-2", state: staticSomething })}>
          pin right 2
        </button>
        <button onClick={() => actions.pinnedRightPanel.pin({ id: "right-2", state: { something: "something else" } })}>
          pin right 2 (alt)
        </button>
        <button onClick={() => actions.pinnedRightPanel.unpin()}>unpin</button>
      </div>
    </div>
  );
}

export const exampleLayout = Template.bind({});
