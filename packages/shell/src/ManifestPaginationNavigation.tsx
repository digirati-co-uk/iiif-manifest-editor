import { getValue } from "@iiif/helpers";
import type { Reference } from "@iiif/presentation-3";
import { BackIcon, ArrowRightIcon } from "@manifest-editor/components";
import type { ReactNode, SVGProps } from "react";
import { useMemo } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import { useEditingResource, useEditingResourceStack } from "./EditingStack/EditingStack";
import { useLayoutActions } from "./Layout/Layout.context";

export interface ManifestPaginationNavigationProps {
  className?: string;
  variant?: "light" | "dark";
}

type CanvasOption = {
  id: string;
  pageNumber: number;
  labelText: string;
};

export function ManifestPaginationNavigation({
  className,
  variant = "light",
}: ManifestPaginationNavigationProps) {
  const manifest = useManifest();
  const vault = useVault();
  const { edit } = useLayoutActions();
  const currentEditingResource = useEditingResource();
  const editingStack = useEditingResourceStack();

  const items = manifest?.items || [];
  const isRev =
    manifest?.viewingDirection === "right-to-left" ||
    manifest?.viewingDirection === "bottom-to-top";
  const isVert =
    manifest?.viewingDirection === "top-to-bottom" ||
    manifest?.viewingDirection === "bottom-to-top";

  const currentCanvasId =
    findCanvasId(currentEditingResource) ||
    editingStack.map(findCanvasId).find(Boolean) ||
    items[0]?.id ||
    "";
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === currentCanvasId),
  );
  const selectedCanvasId = items[currentIndex]?.id || "";
  const currentPage = currentIndex + 1;

  const canvasOptions = useMemo<CanvasOption[]>(() => {
    return items.map((item, index) => {
      const canvas = vault.get({ id: item.id, type: "Canvas" });
      return {
        id: item.id,
        pageNumber: index + 1,
        labelText: getValue(canvas?.label as any) || `Page ${index + 1}`,
      };
    });
  }, [items, vault]);

  const goToCanvas = (canvasId: string) => {
    const index = items.findIndex((item) => item.id === canvasId);
    const canvas = items[index];

    if (!canvas || !manifest) {
      return;
    }

    edit(
      { id: canvas.id, type: "Canvas" },
      {
        parent: { id: manifest.id, type: "Manifest" },
        property: "items",
        index,
      },
      { forceOpen: false },
    );
  };

  if (!manifest || items.length < 2) {
    return null;
  }

  const previousCanvas = items[currentIndex - 1];
  const nextCanvas = items[currentIndex + 1];
  const dark = variant === "dark";

  return (
    <nav
      aria-label="Manifest pagination"
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-1",
        "focus-within:ring-2 focus-within:ring-me-primary-500/40",
        isRev && "flex-row-reverse",
        dark
          ? "border-white/20 bg-white/10 text-white"
          : "border-me-gray-300 bg-white text-me-gray-900",
        className,
      )}
    >
      <NavigationButton
        ariaLabel="Previous canvas"
        disabled={!previousCanvas}
        onClick={() => previousCanvas && goToCanvas(previousCanvas.id)}
        dark={dark}
      >
        <DirectionIcon reverse={isRev} vertical={isVert} />
      </NavigationButton>

      <label
        htmlFor="manifest-pagination-page-select"
        aria-label={`Page ${currentPage} of ${items.length}`}
        className={cx(
          "relative inline-flex min-h-8 cursor-pointer select-none items-center gap-0.5",
          "whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold leading-none",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-me-primary-500/40",
          dark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
            : "border-me-gray-300 bg-me-gray-100 text-me-gray-900 hover:bg-me-primary-50",
        )}
      >
        <span>
          {currentPage} / {items.length}
        </span>
        <ArrowDownIcon
          className={cx("shrink-0 text-base", dark ? "text-white/60" : "text-me-gray-500")}
        />
        <select
          id="manifest-pagination-page-select"
          aria-label="Jump to canvas"
          value={selectedCanvasId}
          onChange={(event) => goToCanvas(event.target.value)}
          className="absolute inset-0 cursor-pointer appearance-none border-0 bg-white opacity-0"
        >
          {canvasOptions.map((canvas) => (
            <option key={canvas.id} value={canvas.id}>
              Page {canvas.pageNumber} - {canvas.labelText}
            </option>
          ))}
        </select>
      </label>

      <NavigationButton
        ariaLabel="Next canvas"
        disabled={!nextCanvas}
        onClick={() => nextCanvas && goToCanvas(nextCanvas.id)}
        dark={dark}
      >
        <DirectionIcon reverse={!isRev} vertical={isVert} />
      </NavigationButton>
    </nav>
  );
}

function findCanvasId(
  resource:
    | {
        resource?: {
          source?: Reference;
        };
      }
    | null
    | undefined,
) {
  const source = resource?.resource?.source;
  return source?.type === "Canvas" ? source.id : null;
}

function NavigationButton({
  ariaLabel,
  children,
  dark,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  dark: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent p-0",
        "text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500/50",
        dark
          ? "text-white hover:bg-white/15 disabled:text-white/40 disabled:hover:bg-transparent"
          : "text-me-gray-900 hover:bg-me-primary-50 disabled:text-me-gray-500 disabled:hover:bg-transparent",
        "disabled:cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function DirectionIcon({
  reverse,
  vertical,
}: {
  reverse: boolean;
  vertical: boolean;
}) {
  const Icon = reverse ? ArrowRightIcon : BackIcon;

  return (
    <Icon
      aria-hidden
      className={cx("block", vertical && "rotate-90")}
    />
  );
}

function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
    >
      <path fill="currentColor" d="m7 10l5 5l5-5z" />
    </svg>
  );
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
