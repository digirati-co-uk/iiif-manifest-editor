import rawUseDropdownMenu from "react-accessible-dropdown-menu-hook";

// The package may arrive as a callable ESM default or a CommonJS namespace.
const importedUseDropdownMenu: unknown = rawUseDropdownMenu;
const useDropdownMenu = (
  typeof importedUseDropdownMenu === "object" &&
  importedUseDropdownMenu !== null &&
  "default" in importedUseDropdownMenu
    ? importedUseDropdownMenu.default
    : importedUseDropdownMenu
) as typeof rawUseDropdownMenu;

export default useDropdownMenu;
