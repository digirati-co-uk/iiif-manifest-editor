import { DefaultTooltipContent, Tooltip, TooltipTrigger } from "@manifest-editor/components";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared look for the template / composition controls in the exhibition Images panel. */
export const ACCENT = "#b84c74";
export const ACCENT_DARK = "#892c4e";
export const ACCENT_TINT = "#fbeff4";
export const ACCENT_BORDER = "#e9b7ca";

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

type Variant = "primary" | "secondary" | "quiet" | "danger";

const variants: Record<Variant, { color: string; background: string; border: string; hover: string }> = {
  primary: { color: "#ffffff", background: ACCENT, border: ACCENT, hover: ACCENT_DARK },
  secondary: { color: ACCENT_DARK, background: "#ffffff", border: ACCENT_BORDER, hover: ACCENT_TINT },
  quiet: { color: "#4b5563", background: "transparent", border: "transparent", hover: "#f3f4f6" },
  danger: { color: "#b42318", background: "transparent", border: "transparent", hover: "#fef3f2" },
};

export function ActionPill({
  variant = "secondary",
  icon,
  children,
  iconOnly = false,
  style,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: ReactNode; iconOnly?: boolean }) {
  const v = variants[variant];
  return (
    <button
      type="button"
      {...props}
      className={`${focusRing} inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        color: v.color,
        background: v.background,
        border: `1px solid ${v.border}`,
        outlineColor: ACCENT,
        height: 28,
        minWidth: iconOnly ? 28 : undefined,
        padding: iconOnly ? 0 : "0 10px",
        ...style,
      }}
      onMouseEnter={(event) => {
        if (!event.currentTarget.disabled) event.currentTarget.style.background = v.hover;
        props.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = v.background;
        props.onMouseLeave?.(event);
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Svg({ children, size = 14 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const PlusIcon = () => (
  <Svg>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const ReplaceIcon = () => (
  <Svg>
    <path d="M3 8h14l-4-4M21 16H7l4 4" />
  </Svg>
);
export const TrashIcon = () => (
  <Svg>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);
export const ArrowUpIcon = () => (
  <Svg>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);
export const ArrowDownIcon = () => (
  <Svg>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Svg>
);
export const UndoIcon = () => (
  <Svg>
    <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);
export const GripIcon = () => (
  <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
    {[3, 8, 13].flatMap((y) => [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />))}
  </svg>
);

/** A small card used to group related controls in the panel. */
export function PanelCard({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "accent" | "warning" }) {
  const tones = {
    plain: { background: "#f9fafb", border: "#e5e7eb" },
    accent: { background: ACCENT_TINT, border: ACCENT_BORDER },
    warning: { background: "#fffaeb", border: "#fedf89" },
  } as const;
  return (
    <div
      className="rounded-lg p-3 text-sm text-gray-700"
      style={{ background: tones[tone].background, border: `1px solid ${tones[tone].border}` }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-gray-900">{children}</h3>
      {aside ? <span className="text-xs text-gray-500">{aside}</span> : null}
    </div>
  );
}

export const CheckIcon = () => (
  <Svg>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);

/** Removing is easy to do by accident next to Replace, and a position can be refilled but not undone in place. */
export function confirmRemoveImage(position?: number) {
  return window.confirm(
    `Remove the image${position ? ` in position ${position}` : ""}?\n\nIts position stays in the layout so you can add another image.`
  );
}

/** A compact icon button whose name is shown in the app tooltip (and is its accessible name). */
export function IconAction({
  label,
  icon,
  variant = "quiet",
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant?: Variant;
  onClick: () => void;
}) {
  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <span style={{ display: "inline-flex" }}>
          <ActionPill variant={variant} iconOnly aria-label={label} icon={icon} onClick={onClick} style={{ height: 32, minWidth: 32 }} />
        </span>
      </TooltipTrigger>
      <DefaultTooltipContent>{label}</DefaultTooltipContent>
    </Tooltip>
  );
}
