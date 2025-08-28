import { ActionButton, AddIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useInlineCreator, useManifestEditor } from "@manifest-editor/shell";

export function RangeCreateEmpty() {
  const { ref, structural } = useManifestEditor();
  const creator = useInlineCreator();

  const createTopLevelRange = () => {
    if (!ref) return;
    creator.create(
      "@manifest-editor/range-top-level",
      {
        label: { en: ["Table of contents"] },
        items: structural.items.getWithoutTracking().map((item) => {
          return item;
        }),
      },
      {
        parent: {
          property: "structures",
          resource: ref(),
        },
      },
    );
  };

  return (
    <Sidebar>
      <SidebarHeader
        title="Ranges"
        actions={[
          {
            icon: <AddIcon className="text-2xl" />,
            title: "Add range",
            disabled: true,
            onClick: () => void 0,
          },
        ]}
      />
      <SidebarContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="p-4 opacity-50 text-center">
            This canvas does not yet have any ranges yet. If you want to offer navigation, such as a table of contents,
            you can create a range.
          </div>

          <ActionButton large primary onPress={() => createTopLevelRange()}>
            <AddIcon className="text-xl" /> Create new range
          </ActionButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
