import {
  Tabs as BaseTabs,
  TabList as BaseTabList,
  Tab as BaseTab,
  TabPanel as BaseTabPanel,
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
} from "react-aria-components";
import { cn } from "./utils";

export function Tabs({ className, children, ...props }: TabsProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <BaseTabs
      className={(state) => {
        const cs = typeof className === "function" ? className(state) : className;
        return cn("", cs);
      }}
      {...props}
    >
      {children}
    </BaseTabs>
  );
}

export function TabList<T extends object>({
  className,
  children,
  ...props
}: TabListProps<T> & React.RefAttributes<HTMLDivElement>) {
  return (
    <BaseTabList
      className={(state) => {
        const cs = typeof className === "function" ? className(state) : className;
        return cn("flex gap-4", cs);
      }}
      {...props}
    >
      {children}
    </BaseTabList>
  );
}

export function Tab({ className, children, ...props }: TabProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <BaseTab
      className={(state) => {
        const cs = typeof className === "function" ? className(state) : className;
        return cn(
          "cursor-default outline-none group py-1 font-semibold px-2 border-b-2 text-me-gray-700",
          state.isSelected && "border-b-me-primary-600 text-black",
          state.isFocusVisible && "focus-visible:bg-me-primary-100",
          cs
        );
      }}
      {...props}
    >
      {children}
    </BaseTab>
  );
}

export function TabPanel({ className, children, ...props }: TabPanelProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <BaseTabPanel
      className={(state) => {
        const cs = typeof className === "function" ? className(state) : className;
        return cn("", cs);
      }}
      {...props}
    >
      {children}
    </BaseTabPanel>
  );
}
