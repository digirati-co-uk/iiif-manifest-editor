import { PinnablePanelState } from "./Layout.types";
import { createElement, ReactNode, useEffect, useLayoutEffect, useRef } from "react";

export function isPinnableState(t: unknown): t is PinnablePanelState {
  return t && (t as any).pinnable;
}

export function panelSizing({
  initial,

  fallback,
  options = {},
}: {
  initial?: number;
  fallback: number;
  options?: { minWidth?: number; maxWidth?: number };
}) {
  // panel min width
  // panel max width
  // default width
  // fallback width
  return Math.max(options.minWidth || 0, Math.min(options.maxWidth || Infinity, initial || fallback));
}

function isHtml(el: unknown): el is HTMLElement | DocumentFragment {
  return !!(el as any).tagName || el instanceof DocumentFragment;
}

function RenderElement(props: { el: HTMLElement | DocumentFragment; as?: any }) {
  const ref = useRef<HTMLElement>();
  useLayoutEffect(() => {
    const container = ref.current;
    const el = props.el;
    if (container) {
      container.appendChild(el);
    }
    return () => {
      if (container) {
        try {
          if (container.hasChildNodes()) {
            container?.removeChild(el);
          }
        } catch (e) {
          // ignore.
        }
      }
    };
  }, [props.el]);

  return createElement(props.as || "div", { ref });
}

export function renderHelper(htmlOrReact: string | ReactNode | HTMLElement | DocumentFragment): ReactNode {
  if (typeof htmlOrReact === "string") {
    return createElement("div", { dangerouslySetInnerHTML: { __html: htmlOrReact } });
  }
  if (isHtml(htmlOrReact)) {
    return createElement(RenderElement, { el: htmlOrReact });
  }

  return htmlOrReact;
}
