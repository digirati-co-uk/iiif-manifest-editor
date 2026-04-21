import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SVGProps } from "react";
import { cn } from "./utils";

export type BackgroundActionMenuStatus = "idle" | "preparing" | "running" | "complete" | "error" | "cancelled";

const statusColours: Record<BackgroundActionMenuStatus, string> = {
  idle: "bg-gray-300",
  preparing: "bg-orange-400",
  running: "bg-orange-400",
  complete: "bg-green-600",
  error: "bg-red-600",
  cancelled: "bg-gray-400",
};

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
        "pointer-events-none absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-md border border-zinc-200 bg-white p-3 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.1)]",
        open && "pointer-events-auto opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-2 text-xs font-semibold uppercase tracking-wide leading-none text-zinc-400", className)}
      {...props}
    />
  );
}

export function BackgroundActionMenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-2 h-px bg-zinc-100", className)} {...props} />;
}

export function BackgroundActionMenuItem({
  className,
  status = "idle",
  ...props
}: HTMLAttributes<HTMLDivElement> & { status?: BackgroundActionMenuStatus }) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-2 rounded px-1",
        status === "error" && "bg-red-50 outline outline-1 outline-red-200",
        className,
      )}
      {...props}
    />
  );
}

export function BackgroundActionMenuTrigger({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded border-0 bg-transparent px-2 py-1.5 text-left text-black",
        "hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none disabled:cursor-default disabled:text-zinc-400",
        className,
      )}
      type="button"
      {...props}
    />
  );
}

export function BackgroundActionMenuStatusDot({
  className,
  status = "idle",
}: {
  className?: string;
  status?: BackgroundActionMenuStatus;
}) {
  return <span className={cn("h-2 w-2 flex-none rounded-full", statusColours[status], className)} />;
}

export function BackgroundActionMenuText({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />;
}

export function BackgroundActionMenuLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("truncate text-sm font-medium leading-tight", className)} {...props} />;
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
        "cursor-pointer border-0 bg-transparent px-3 text-sm leading-none text-blue-500 underline hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function BackgroundActionMenuActionButton({
  className,
  running,
  ...props
}: {
  className?: string;
  running?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex w-9 flex-none cursor-pointer items-center justify-center rounded border-0 bg-transparent text-sm",
        "hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:cursor-default",
        running ? "text-zinc-700" : "text-zinc-400",
        className,
      )}
      type="button"
      {...props}
    >
      {running ? <BackgroundActionMenuStopIcon aria-hidden /> : <BackgroundActionMenuPlayIcon aria-hidden />}
    </button>
  );
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

function BackgroundActionMenuPlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

function BackgroundActionMenuStopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="4 4 16 16" xmlns="http://www.w3.org/2000/svg" height="1em" width="1em">
      <path fill="currentColor" d="M7 7h10v10H7z" />
    </svg>
  );
}
