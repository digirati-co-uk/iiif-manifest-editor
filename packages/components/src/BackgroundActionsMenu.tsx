import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SVGProps } from "react";
import { InfoIcon } from "./icons/InfoIcon";
import { cn } from "./utils";

export type BackgroundActionMenuStatus = "idle" | "preparing" | "running" | "complete" | "error" | "cancelled";

export function BackgroundActionMenuRoot({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative ml-2", className)} {...props} />;
}

export function BackgroundActionMenuButton({
  className,
  active,
  runningCount = 0,
  errorCount = 0,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  runningCount?: number;
  errorCount?: number;
}) {
  const hasError = errorCount > 0;
  const isRunning = runningCount > 0;

  return (
    <button
      className={cn(
        "relative cursor-pointer rounded-md border-0 bg-me-gray-100 p-1.5 text-xl text-me-primary-500",
        "hover:bg-me-primary-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-me-primary-500",
        active && "bg-me-primary-500 text-white",
        className,
      )}
      type="button"
      {...props}
    >
      {children || <BackgroundActionMenuCogIcon aria-hidden />}
      {hasError ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
          {errorCount > 9 ? "9+" : errorCount}
        </span>
      ) : isRunning ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full bg-orange-400 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
          {runningCount > 9 ? "9+" : runningCount}
        </span>
      ) : null}
    </button>
  );
}

export function BackgroundActionMenuPanel({
  className,
  open,
  ...props
}: HTMLAttributes<HTMLDivElement> & { open?: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-200 bg-white opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-[opacity,transform] duration-150 ease-out translate-y-2 overflow-hidden",
        open && "pointer-events-auto opacity-100 translate-y-0",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest leading-none text-zinc-400", className)}
      {...props}
    />
  );
}

export function BackgroundActionMenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1.5 h-px bg-zinc-100", className)} {...props} />;
}

export function BackgroundActionMenuItem({
  className,
  status = "idle",
  ...props
}: HTMLAttributes<HTMLDivElement> & { status?: BackgroundActionMenuStatus }) {
  return (
    <div
      className={cn(
        "mx-1.5 flex items-stretch gap-0 rounded-md overflow-hidden",
        status === "error" && "bg-red-50 outline outline-1 outline-red-200",
        (status === "running" || status === "preparing") && "bg-orange-50/60",
        status === "complete" && "bg-green-50/60",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuTrigger({
  className,
  running,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { running?: boolean }) {
  return (
    <button
      className={cn(
        "group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent px-3 py-2 text-left text-black",
        "hover:bg-black/5 focus:bg-black/5 focus:outline-none",
        className,
      )}
      type="button"
      {...props}
    >
      {/* Play / Stop icon */}
      <span className="flex-none text-zinc-400 group-hover:text-zinc-600">
        {running ? <StopIcon aria-hidden /> : <PlayIcon aria-hidden />}
      </span>
      {props.children}
    </button>
  );
}

export function BackgroundActionMenuText({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />;
}

export function BackgroundActionMenuLabel({
  className,
  running,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { running?: boolean }) {
  return (
    <span
      className={cn(
        "truncate text-sm font-medium leading-tight text-zinc-800",
        running && "text-zinc-600",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuMeta({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "error" }) {
  return (
    <span
      className={cn(
        "text-xs leading-tight",
        variant === "error" ? "text-red-500 font-medium line-clamp-2" : "truncate text-zinc-400",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuInlineAction({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) {
  return (
    <button
      className={cn(
        "flex-none cursor-pointer self-center border-0 bg-transparent px-2 py-1 text-xs font-medium leading-none text-me-primary-500 hover:text-me-primary-600 focus:outline-none focus:ring-2 focus:ring-me-primary-200 rounded",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function BackgroundActionMenuInfoButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex w-8 flex-none cursor-pointer items-center justify-center self-stretch border-0 border-l border-transparent bg-transparent text-[15px] text-zinc-300",
        "hover:border-zinc-100 hover:bg-zinc-50 hover:text-zinc-500 focus:outline-none",
        className,
      )}
      type="button"
      {...props}
    >
      <InfoIcon aria-hidden style={{ display: "block" }} />
    </button>
  );
}

export function BackgroundActionMenuProgressBar({
  className,
  percent,
  label,
}: {
  className?: string;
  percent: number;
  label?: string;
}) {
  const value = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  const rounded = Math.round(value);

  return (
    <span className={cn("flex w-full items-center gap-2 pt-0.5", className)}>
      <span
        className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200"
        role="progressbar"
        aria-label={label || "Background action progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
      >
        <span className="block h-full rounded-full bg-me-primary-500 transition-[width] duration-500 ease-out" style={{ width: `${value}%` }} />
      </span>
      <span className="w-7 flex-none text-right text-[10px] font-medium leading-none text-zinc-400">{rounded}%</span>
    </span>
  );
}

/** @deprecated — play/stop now lives inside BackgroundActionMenuTrigger */
export function BackgroundActionMenuActionButton({
  className,
  running,
  ...props
}: {
  className?: string;
  running?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return null;
}

/** @deprecated — status is conveyed by row background and meta text */
export function BackgroundActionMenuStatusDot({
  className,
  status = "idle",
}: {
  className?: string;
  status?: BackgroundActionMenuStatus;
}) {
  return null;
}

export function BackgroundActionMenuCogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g id="Header-design" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Artboard" transform="translate(-1125, -19)">
          <g id="Actions" transform="translate(1125, 19)">
            <circle id="Oval" stroke="currentColor" strokeWidth="2" cx="10" cy="10" r="9"></circle>
            <polygon
              id="Triangle"
              fill="currentColor"
              transform="translate(11.0714, 10) rotate(-270) translate(-11.0714, -10)"
              points="11.0714286 6.42857143 15.7142857 13.5714286 6.42857143 13.5714286"
            ></polygon>
          </g>
        </g>
      </g>
    </svg>
  );
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="currentColor">
      <path d="M3 2.5v11l10-5.5z" />
    </svg>
  );
}

function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
    </svg>
  );
}
