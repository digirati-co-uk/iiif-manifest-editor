import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { CanvasListStyles as S } from "@/_panels/left-panels/CanvasList/CanvasList.styles";
import { AppState } from "@/shell/AppContext/AppContext";

export default { id: "storybook", title: "Storybook" };

const invalid = ["Manifest Editor/AddManifestModal", "Manifest Editor/Modals"];

function parseStories(modules: any) {
  const files = Object.keys(modules);
  const validStories = [];

  for (const file of files) {
    const mod = modules[file];
    const metadata = mod.default as { title: string; component: any; panel?: string };

    if (invalid.includes(metadata.title)) {
      continue;
    }

    if (metadata) {
      const components = [];
      const keys = Object.keys(mod);
      for (const key of keys) {
        const item = mod[key];
        if (key === "default") {
          continue;
        }

        components.push(item);
      }

      validStories.push({
        metadata,
        components,
      });
    }
  }

  return validStories;
}

const state = parseStories(import.meta.globEager("../../**/*.stories.ts*"));

function AllStories(app: AppState) {
  return (
    <div style={{ flex: 1 }}>
      <S.Container>
        {state.map((item, n) => {
          return (
            <S.ItemContainer key={n} onClick={() => app.setState({ story: n })} $selected={n === app.state.story}>
              <S.ItemLabel>{item.metadata.title}</S.ItemLabel>
              <S.ItemIdentifier>{item.metadata.title}</S.ItemIdentifier>
            </S.ItemContainer>
          );
        })}
      </S.Container>
    </div>
  );
}

export const leftPanels: LayoutPanel[] = [
  {
    id: "story-list",
    label: "Stories",
    icon: "",
    render: (_, ctx, app) => {
      const item = state[app.state.story];
      if (!item || (item.metadata as any).panel !== "left") {
        return <AllStories {...app} />;
      }

      return (
        <div style={{ flex: 1 }}>
          {item.components.map((Component: any, n) => (
            <ErrorBoundary key={n}>
              <Component />
            </ErrorBoundary>
          ))}
        </div>
      );
    },
  },
];

export const centerPanels: LayoutPanel[] = [
  {
    id: "storybook",
    label: "Storybook",
    icon: "",
    render: (_, ctx, app) => {
      const item = state[app.state.story];
      if (!item) {
        return <div>Choose story</div>;
      }
      if (!item || (item.metadata as any).panel === "right" || (item.metadata as any).panel === "left") {
        return null;
      }

      return (
        <div style={{ padding: 40 }}>
          <div style={{ background: "#fff", padding: 20 }}>
            <div>
              {item.components.map((Component: any) => (
                <ErrorBoundary>
                  <Component />
                </ErrorBoundary>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },
];

export const rightPanels: LayoutPanel[] = [
  {
    id: "storybook",
    label: "Storybook",
    icon: "",
    render: (_, ctx, app) => {
      const item = state[app.state.story];

      if (!item || ((item.metadata as any).panel !== "left" && (item.metadata as any).panel !== "right")) {
        return null;
      }

      if ((item.metadata as any).panel === "left") {
        return <AllStories {...app} />;
      }

      return (
        <div style={{ flex: 1 }}>
          {item.components.map((Component: any, n) => (
            <ErrorBoundary key={n}>
              <Component />
            </ErrorBoundary>
          ))}
        </div>
      );
    },
  },
];
