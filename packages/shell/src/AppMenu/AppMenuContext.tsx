import { createContext, useContext } from "react";

type MenuItem = {
  label: string;
  onClick?: () => void;
  active?: boolean;
};

interface AppMenuContext {
  file: {
    new: MenuItem;
    edit: MenuItem;
    open: MenuItem;

    newOptions: MenuItem[];
    openOptions: MenuItem[];
  };
}

const ReactAppMenuContext = createContext<AppMenuContext | null>(null);

export function useAppMenu() {
  const ctx = useContext(ReactAppMenuContext);

  if (!ctx) {
    return null;
  }

  return ctx;
}

export function useAppMenuItem<
  Key extends keyof AppMenuContext,
  Name extends keyof AppMenuContext[Key],
  Return extends AppMenuContext[Key][Name],
>(menu: Key, name: Name): Return | null {
  const ctx = useAppMenu();

  if (!ctx) {
    return null;
  }

  return ctx[menu][name] as Return;
}

export function AppMenuProvider({ children, menu }: { children: React.ReactNode; menu: AppMenuContext }) {
  return <ReactAppMenuContext.Provider value={menu}>{children}</ReactAppMenuContext.Provider>;
}
