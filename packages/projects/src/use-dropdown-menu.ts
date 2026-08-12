import rawUseDropdownMenu from "react-accessible-dropdown-menu-hook";

const useDropdownMenu = (
  typeof rawUseDropdownMenu === "object" && rawUseDropdownMenu !== null && "default" in rawUseDropdownMenu
    ? rawUseDropdownMenu.default
    : rawUseDropdownMenu
) as typeof rawUseDropdownMenu;

export default useDropdownMenu;
