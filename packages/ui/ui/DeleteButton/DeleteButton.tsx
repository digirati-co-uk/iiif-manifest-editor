import { ReactNode } from "react";
import { ModalButton } from "../../madoc/components/ModalButton";
import { ButtonGroup, Button } from "../../atoms/Button";
import { DeleteButtonStyle } from "./DeleteButton.styles";

export function DeleteButton({
  label,
  message,
  onDelete,
  children,
}: {
  label?: string;
  message?: string;
  children?: ReactNode;
  onDelete: () => void | Promise<void>;
}) {
  return (
    <ModalButton
      title={message || "Are you sure you want to delete?"}
      render={() => <>{children}</>}
      renderFooter={({ close }) => {
        return (
          <ButtonGroup style={{ marginLeft: "auto" }}>
            <Button
              onClick={async () => {
                await onDelete();
                close();
              }}
            >
              {label || "Delete"}
            </Button>
          </ButtonGroup>
        );
      }}
    >
      <DeleteButtonStyle>{label || "Delete"}</DeleteButtonStyle>
    </ModalButton>
  );
}
