import React from "react";

export function useAccessibleClick(onClick: () => void) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onClick();
    }
  };

  return { onClick, onKeyDown };
}
