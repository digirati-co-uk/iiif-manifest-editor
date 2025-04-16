import type { LayoutPanel } from "@manifest-editor/shell";

export const collectionOverview: LayoutPanel = {
  id: "collection-overview",
  label: "Collection Overview",
  icon: "",
  render: () => <CollectionOverviewCenterPanel />,
};

export function CollectionOverviewCenterPanel() {
  return <div>Collection overview center</div>;
}
