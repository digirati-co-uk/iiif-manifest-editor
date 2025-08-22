import { type LayoutPanel, useLayoutActions } from "@manifest-editor/shell";
import { type SVGProps, useEffect } from "react";

export function HomeIcon({ title, titleId, ...props }: SVGProps<SVGSVGElement> & { title?: string; titleId?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z" />
    </svg>
  );
}

export const overviewPanel: LayoutPanel = {
  id: "left-panel-overview",
  label: "Overview",
  icon: <HomeIcon />,
  render: (state, ctx, app) => {
    return <Overview />;
  },
};

export function Overview() {
  const { open } = useLayoutActions();

  useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const canvas = queryString.get("canvas");
    if (canvas) {
      return;
    }
    open({ id: "overview" });
  }, []);

  return (
    <div className="p-4">
      <h1>Overview</h1>
      <p>This is the overview page for the manifest editor.</p>
    </div>
  );
}
