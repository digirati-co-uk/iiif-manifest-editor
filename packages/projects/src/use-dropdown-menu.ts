import rawUseDropdownMenu from "react-accessible-dropdown-menu-hook";

const candidate: unknown = rawUseDropdownMenu;

const useDropdownMenu = (
  typeof candidate === "object" && candidate !== null && "default" in candidate ? candidate.default : rawUseDropdownMenu
) as typeof rawUseDropdownMenu;

export default useDropdownMenu;
