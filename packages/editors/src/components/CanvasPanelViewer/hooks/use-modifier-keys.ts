import { useLayoutEffect, useRef } from "react";

export function useModifierKeys() {
  const modifierKeys = useRef({
    ctrl: false,
    shift: false,
    alt: false,
  });

  useLayoutEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "Shift") modifierKeys.current.shift = true;
      if (e.key === "Control") modifierKeys.current.ctrl = true;
      if (e.key === "Alt") modifierKeys.current.alt = true;
    }
    function keyUp(e: KeyboardEvent) {
      if (e.key === "Shift") modifierKeys.current.shift = false;
      if (e.key === "Control") modifierKeys.current.ctrl = false;
      if (e.key === "Alt") modifierKeys.current.alt = false;
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return modifierKeys;
}
