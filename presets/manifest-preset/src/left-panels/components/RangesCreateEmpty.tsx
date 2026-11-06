import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, AddIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useInlineCreator, useManifestEditor } from "@manifest-editor/shell";

export function RangeCreateEmpty() {
  const t = useTranslations("manifest");
  const { ref, structural } = useManifestEditor();
  const creator = useInlineCreator();

  const createTopLevelRange = async () => {
    if (!ref) return;
    const allItemsRange = await creator.create(
      "@manifest-editor/range-top-level",
      {
        label: { en: ["Range 1"] },
        type: "Range",
        items: structural.items.getWithoutTracking().map((item) => {
          return item;
        }),
      },
      {
        rootId: ref().id,
      }
    );

    creator.create(
      "@manifest-editor/range-top-level",
      {
        type: "Range",
        label: { en: ["Table of contents"] },
        items: [allItemsRange],
      },
      {
        parent: {
          property: "structures",
          resource: ref(),
        },
      }
    );
  };

  return (
    <Sidebar>
      <SidebarHeader
        title={t("panels.ranges")}
        actions={[
          {
            icon: <AddIcon className="text-2xl" />,
            title: t("workflow.addRange"),
            disabled: true,
            onClick: () => void 0,
          },
        ]}
      />
      <SidebarContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="p-4 opacity-50 text-center">{t("workflow.createRangeHelp")}</div>

          <ActionButton large primary onPress={() => createTopLevelRange()}>
            <AddIcon className="text-xl" /> {t("workflow.createNewRange")}
          </ActionButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
