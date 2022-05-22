import { useMemo } from "react";
import { getApps } from "../../apps/app-loader";
import { Layout } from "../../shell/Layout/Layout";

export function RenderApp({ selectedApplication }: { selectedApplication: string }) {
  const { allApps } = useMemo(() => getApps(), []);
  const selectedApp = allApps[selectedApplication];

  return selectedApp ? <Layout key={selectedApplication} {...selectedApp} /> : null;
}
