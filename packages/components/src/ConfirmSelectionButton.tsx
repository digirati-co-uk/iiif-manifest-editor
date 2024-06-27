import { ReactNode } from "react";
import { Button } from "react-aria-components";

export function ConfirmSelectionButton({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  return (
    <Button className="bg-me-primary-500 px-3 py-1 hover:bg-me-primary-600 text-white rounded" onPress={onPress}>
      {children}
    </Button>
  );
}
