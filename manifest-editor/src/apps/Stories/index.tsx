import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { CanvasListStyles as S } from "@/_panels/left-panels/CanvasList/CanvasList.styles";
import { AppState } from "@/shell/AppContext/AppContext";
import { Fragment, useEffect } from "react";

export default { id: "storybook", title: "Storybook" };

const invalid = ["Manifest Editor/AddManifestModal", "Manifest Editor/Modals"];

function formatKey(s: string) {
  return s
    .replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
      return " " + y.toLowerCase();
    })
    .replace(/^ /, "");
}

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

        components.push({ component: item, key });
      }

      validStories.push({
        metadata,
        components,
      });
    }
  }

  return validStories;
}

const state = parseStories(import.meta.glob("../../**/*.stories.ts*", { eager: true }));

function AllStories(app: AppState) {
  useEffect(() => {
    window.location.hash = `?app=storybook&story=${app.state.story}&component=${app.state.component}`;
  }, [app.state.story, app.state.component]);

  return (
    <div style={{ flex: 1 }}>
      <S.Container>
        {state.map((item, n) => {
          return (
            <Fragment key={n}>
              <S.SectionLabel>{item.metadata.title}</S.SectionLabel>
              <S.Section>
                {item.components.map((component, n2) => {
                  return (
                    <S.ItemContainer
                      key={n2}
                      onClick={() => app.setState({ story: item.metadata.title, component: component.key })}
                      $selected={item.metadata.title === app.state.story && component.key === app.state.component}
                    >
                      <S.ItemLabel>{formatKey(component.key)}</S.ItemLabel>
                    </S.ItemContainer>
                  );
                })}
              </S.Section>
            </Fragment>
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
      const item = getStory(app.state.story);

      if (!item || (item.metadata as any).panel !== "left") {
        return <AllStories {...app} />;
      }

      return (
        <div style={{ flex: 1 }}>
          {item.components.map(({ component: Component, key }: any, n) =>
            app.state.component && key === app.state.component ? (
              <ErrorBoundary key={n}>
                <Component {...(Component.args || {})} />
              </ErrorBoundary>
            ) : null
          )}
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
      const item = getStory(app.state.story);
      if (!item) {
        return <div>Choose story</div>;
      }
      if (!item || (item.metadata as any).panel === "right" || (item.metadata as any).panel === "left") {
        return null;
      }

      return (
        <div style={{ padding: 40 }}>
          <div style={{ background: "#fff", padding: 20, overflowY: "auto" }}>
            <div>
              {item.components.map(({ component: Component, key }: any, n) =>
                app.state.component && key === app.state.component ? (
                  <ErrorBoundary key={n}>
                    <Component {...(Component.args || {})} />
                  </ErrorBoundary>
                ) : null
              )}
            </div>
          </div>
        </div>
      );
    },
  },
];

function getStory(current: string) {
  return state.find((s) => s.metadata.title === current);
}

export const rightPanels: LayoutPanel[] = [
  {
    id: "storybook",
    label: "Storybook",
    icon: "",
    render: (_, ctx, app) => {
      const item = getStory(app.state.story);

      if (!item || ((item.metadata as any).panel !== "left" && (item.metadata as any).panel !== "right")) {
        return null;
      }

      if ((item.metadata as any).panel === "left") {
        return <AllStories {...app} />;
      }

      return (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {item.components.map(({ component: Component, key }: any, n) =>
            app.state.component && key === app.state.component ? (
              <ErrorBoundary key={n}>
                <Component {...(Component.args || {})} />
              </ErrorBoundary>
            ) : null
          )}
        </div>
      );
    },
  },
];
