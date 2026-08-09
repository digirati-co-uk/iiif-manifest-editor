import type useDropdownMenuType from "react-accessible-dropdown-menu-hook";
import * as dropdownMenuModule from "react-accessible-dropdown-menu-hook";

export function resolveDropdownMenu(module: any): typeof useDropdownMenuType {
  const defaultExport = Reflect.get(module, "default");
  return (Reflect.get(defaultExport ?? {}, "default") ?? defaultExport ?? module) as typeof useDropdownMenuType;
}

const useDropdownMenu = resolveDropdownMenu(dropdownMenuModule);

export default useDropdownMenu;
