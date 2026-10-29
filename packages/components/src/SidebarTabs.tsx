import { ComponentI18nProvider } from "./ComponentI18nProvider";
import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { createHideableComponent } from "@react-aria/collections";
import { memo, type ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { createPortal } from "react-dom";
import { cn } from "./utils";

interface SidebarTabsProps {
  menuId: string;
  menu: Array<{
    id: string;
    label: string;
    labelMessage?: MessageReference;
    renderComponent: () => ReactNode;
  }>;

  selectedKey?: string;
  onSelectionChange?: (key: string) => void;

  // New future options.
  isNested?: boolean;
  rootResource?: { id: string; type: string };
}

function SidebarTabsContent({ menu, menuId, selectedKey, onSelectionChange }: SidebarTabsProps) {
  const { resolveMessage } = useEditorI18n();
  const labels = menu.map((item) => resolveMessage(item.labelMessage, item.label));
  const labelSignature = JSON.stringify(labels);
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(0);
  const [hiddenMenu, setHiddenMenu] = useState<HTMLDivElement | null>(null);
  const widths = useRef<number[]>([]);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);

  const selectedIndex = useMemo(() => menu.findIndex((item) => item.id === selectedKey), [menu, selectedKey]);

  useLayoutEffect(() => {
    widths.current = [];
    const cb = () => {
      // React Aria may commit translated collection text after the parent effect.
      // Refresh on the existing interval as well as at label changes.
      // Reveal hidden tabs only for synchronous measurement, restoring before paint.
      const items = itemsRef.current.filter((item): item is HTMLDivElement => !!item);
      const displays = items.map((item) => item.style.display);
      try {
        for (const item of items) item.style.display = "block";
        widths.current = items.map((item) => item.getBoundingClientRect().width);
      } finally {
        items.forEach((item, index) => {
          item.style.display = displays[index]!;
        });
      }

      const fullWidth = widths.current.reduce((a, b) => a + b, 0);

      if (fullWidth && ref.current) {
        const el = ref.current;
        const width = el.getBoundingClientRect().width - 20; // 60 is the width of the "more" button

        let hidden = 0;
        let total = 0;
        for (let i = widths.current.length - 1; i >= 0; i--) {
          total += widths.current[i]!;
          if (total > width) {
            hidden = i + 1;
            break;
          }
        }

        setHidden(hidden);
      }
    };
    cb();
    const interval = setInterval(cb, 500);

    return () => {
      clearInterval(interval);
    };
  }, [labelSignature, menu]);

  const menuHidden = menu.filter((item, idx) => hidden >= menu.length - idx);

  return (
    <>
      <Tabs
        className="w-full flex-1 overflow-hidden flex flex-col"
        key={menuId}
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange as any}
      >
        <div className="flex items-center w-full tab-shadow">
          <TabList ref={ref} className="flex-1 overflow-hidden w-full flex text-sm whitespace-nowrap">
            {menu.map((item, idx) => {
              const isHidden = hidden >= menu.length - idx;
              return (
                <SidebarTab key={item.id} id={item.id} idx={idx} isHidden={isHidden} itemsRef={itemsRef}>
                  {labels[idx]}
                </SidebarTab>
              );
            })}
          </TabList>
          <div ref={setHiddenMenu} />
        </div>
        {menu.map((item) => (
          <TabPanel key={item.id} id={item.id} className="flex-1 overflow-y-auto h-full">
            {selectedKey === item.id ? item.renderComponent() : null}
          </TabPanel>
        ))}
      </Tabs>

      {/* This is a bug where buttons that are not tabs can't be inside the <Tabs/> context, since the context is overwritten. */}
      {hiddenMenu && hidden > 0
        ? createPortal(
            <MoreMenu
              hidden={hidden}
              menuHidden={menuHidden}
              selectedIndex={selectedIndex}
              selectedKey={selectedKey}
              onSelectionChange={onSelectionChange}
            />,
            hiddenMenu
          )
        : null}
    </>
  );
}

/** Memoized Tab item — prevents new inline function props from re-triggering React Aria's
 * collection `setProps`/`queueUpdate` cycle on every parent render. */
const SidebarTab = memo(function SidebarTab({
  id,
  idx,
  isHidden,
  itemsRef,
  children,
}: {
  id: string;
  idx: number;
  isHidden: boolean;
  itemsRef: React.MutableRefObject<Array<HTMLDivElement | null>>;
  children: React.ReactNode;
}) {
  return (
    <Tab
      ref={(el) => {
        itemsRef.current[idx] = el as any;
      }}
      id={id}
      className={({ isSelected, isFocusVisible }) =>
        cn(
          "border-b-2 px-2 py-1 text-sm text-gray-600 select-none hover:text-black focus:outline-none",
          isSelected && "border-me-primary-500 text-black",
          isFocusVisible && "ring-2 ring-inset ring-me-primary-500 bg-me-gray-100",
          isHidden && "hidden"
        )
      }
    >
      {children}
    </Tab>
  );
});

const MoreMenu = createHideableComponent<
  {},
  {
    selectedIndex: number;
    hidden: number;
    menuHidden: Array<{ id: string; label: string; labelMessage?: MessageReference }>;
    selectedKey: string | undefined;
    onSelectionChange?: (key: string) => void;
  }
>(({ selectedIndex, hidden, menuHidden, selectedKey, onSelectionChange }) => {
  const { resolveMessage, locale, direction } = useEditorI18n();
  const t = useTranslations("components");
  return (
    <MenuTrigger>
      <Button
        aria-label={t("panels.moreTabs")}
        className={cn(
          "min-h-6 border-none rounded bg-gray-100 px-1.5 py-1 mr-2 mb-1 text-me-primary-600 semibold uppercase text-[10px]",
          selectedIndex > hidden && "bg-me-primary-500 text-white rounded"
        )}
      >
        {t("panels.more")}
      </Button>
      <Popover lang={locale} dir={direction}>
        {menuHidden.length ? (
          <Menu className="bg-white rounded shadow-lg flex flex-col gap-0.5 p-0.5 min-w-28">
            {menuHidden.map((item) => {
              return (
                <MenuItem
                  className={(state) =>
                    cn(
                      "hover:bg-me-gray-100 p-1 rounded-sm text-sm",
                      selectedKey === item.id && "ring ring-me-primary-500"
                    )
                  }
                  key={item.id}
                  onAction={() => onSelectionChange?.(item.id)}
                >
                  {resolveMessage(item.labelMessage, item.label)}
                </MenuItem>
              );
            })}
          </Menu>
        ) : null}
      </Popover>
    </MenuTrigger>
  );
});

export function SidebarTabs(props: SidebarTabsProps) {
  return (
    <ComponentI18nProvider>
      <SidebarTabsContent {...props} />
    </ComponentI18nProvider>
  );
}
