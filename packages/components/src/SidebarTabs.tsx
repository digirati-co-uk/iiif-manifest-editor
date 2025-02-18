import {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { createHideableComponent } from "@react-aria/collections";
import { cn } from "./utils";

interface SidebarTabsProps {
  menuId: string;
  menu: Array<{
    id: string;
    label: string;
    renderComponent: () => ReactNode;
  }>;

  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
}
export function SidebarTabs({
  menu,
  menuId,
  selectedKey,
  onSelectionChange,
}: SidebarTabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(0);
  const widths = useRef<number[]>([]);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);

  const selectedIndex = useMemo(
    () => menu.findIndex((item) => item.id === selectedKey),
    [menu, selectedKey],
  );

  useLayoutEffect(() => {
    const cb = () => {
      if (widths.current.length === 0) {
        widths.current = [];
        for (const item of itemsRef.current) {
          if (item) {
            widths.current.push(item.getBoundingClientRect().width);
          }
        }
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
  }, []);

  const menuHidden = menu.filter((item, idx) => hidden >= menu.length - idx);

  return (
    <Tabs
      className="w-full flex-1 overflow-hidden flex flex-col"
      key={menuId}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange as any}
    >
      <div className="flex items-center w-full tab-shadow">
        <TabList
          ref={ref}
          className="flex-1 overflow-hidden w-full flex text-sm whitespace-nowrap"
        >
          {menu.map((item, idx) => {
            const isHidden = hidden >= menu.length - idx;
            return (
              <Tab
                ref={(el) => (itemsRef.current[idx] = el as any)}
                id={item.id}
                key={item.id}
                className={(state) =>
                  cn(
                    //
                    "border-b-2 px-2 py-1 text-sm text-gray-400 select-none hover:text-black focus:ring-0 focus:outline-none",
                    state.isSelected && "border-me-primary-500 text-black",
                    state.isFocusVisible && "ring-0 bg-me-gray-100",
                    isHidden && "hidden",
                  )
                }
              >
                {item.label}
              </Tab>
            );
          })}
        </TabList>
        {hidden > 0 && (
          <MoreMenu
            hidden={hidden}
            menuHidden={menuHidden}
            selectedIndex={selectedIndex}
            selectedKey={selectedKey}
            onSelectionChange={onSelectionChange}
          />
        )}
      </div>

      {menu.map((item) => (
        <TabPanel
          key={item.id}
          id={item.id}
          className="flex-1 overflow-y-auto h-full"
        >
          {item.renderComponent}
        </TabPanel>
      ))}
    </Tabs>
  );
}

const MoreMenu = createHideableComponent<
  {},
  {
    selectedIndex: number;
    hidden: number;
    menuHidden: Array<{ id: string; label: string }>;
    selectedKey: string | undefined;
    onSelectionChange?: (key: string) => void;
  }
>(({ selectedIndex, hidden, menuHidden, selectedKey, onSelectionChange }) => {
  return (
    <MenuTrigger>
      <Button
        className={cn(
          "border-none rounded bg-gray-100 px-1.5 py-1 mr-2 mb-1 text-me-primary-500 semibold uppercase text-[10px]",
          selectedIndex > hidden && "bg-me-primary-500 text-white rounded",
        )}
      >
        MORE
      </Button>
      <Popover>
        {menuHidden.length ? (
          <Menu
            key={menuHidden.length}
            items={menuHidden}
            dependencies={[menuHidden.length]}
            className="bg-white rounded shadow-lg flex flex-col gap-0.5 p-0.5 min-w-28"
          >
            {(item) => {
              return (
                <MenuItem
                  className={(state) =>
                    cn(
                      "hover:bg-me-gray-100 p-1 rounded-sm text-sm",
                      selectedKey === item.id && "ring ring-me-primary-500",
                    )
                  }
                  key={item.id}
                  onAction={() => onSelectionChange?.(item.id)}
                >
                  {item.label}
                </MenuItem>
              );
            }}
          </Menu>
        ) : null}
      </Popover>
    </MenuTrigger>
  );
});
