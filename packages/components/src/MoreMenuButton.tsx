import { Button } from "react-aria-components";
import { MoreMenuIcon } from "./icons/MoreMenu";

export function MoreMenuButton() {
  return (
    <Button className="rounded-full bg-gray-200 text-gray-500 hover:bg-me-600 hover:text-white data-[pressed]:bg-me-600 data-[pressed]:text-white">
      <MoreMenuIcon className="text-xl" />
    </Button>
  );
}
