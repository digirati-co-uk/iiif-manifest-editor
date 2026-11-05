import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** "Collapse all" / "Expand all": every Collapsible follows the latest instruction, then can be toggled freely. */
export const FoldContext = createContext<{ open: boolean; tick: number }>({ open: true, tick: 0 });

export function Chevron({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 transition-transform ${open ? "rotate-90" : ""} ${className}`}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function Collapsible({
  title,
  actions,
  children,
  defaultOpen = true,
  reveal = false,
  className = "",
  style,
  headerClassName = "",
  headerStyle,
  buttonClassName = "",
  id,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Opens the section when it flips to true, e.g. because it holds the selected change. */
  reveal?: boolean;
  className?: string;
  style?: CSSProperties;
  headerClassName?: string;
  /** Structural spacing is passed inline so the layout holds even before new utility classes are generated. */
  headerStyle?: CSSProperties;
  buttonClassName?: string;
  id?: string;
}) {
  const fold = useContext(FoldContext);
  const [open, setOpen] = useState(defaultOpen);
  const lastTick = useRef(fold.tick);
  useEffect(() => {
    if (fold.tick !== lastTick.current) {
      lastTick.current = fold.tick;
      setOpen(fold.open);
    }
  }, [fold]);
  useEffect(() => {
    if (reveal) setOpen(true);
  }, [reveal]);
  return (
    <section id={id} className={className} style={style}>
      <div className={`flex items-center gap-2 ${headerClassName}`} style={headerStyle}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex min-w-0 flex-1 items-center gap-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-me-primary-500 ${buttonClassName}`}
        >
          <Chevron open={open} className="text-xs text-gray-500" />
          {title}
        </button>
        {actions}
      </div>
      {open && children}
    </section>
  );
}
