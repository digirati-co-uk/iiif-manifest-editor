import type useDropdownMenuType from "react-accessible-dropdown-menu-hook";
import * as dropdownMenuModule from "react-accessible-dropdown-menu-hook";

const imported = dropdownMenuModule as any;
const useDropdownMenu = (imported.default?.default ?? imported.default ?? imported) as typeof useDropdownMenuType;

export default useDropdownMenu;
