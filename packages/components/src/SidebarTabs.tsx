import { ComponentI18nProvider } from "./ComponentI18nProvider";
import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { createHideableComponent } from "@react-aria/collections";
import { memo, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Select,
  SelectValue,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { createPortal } from "react-dom";
import { cn } from "./utils";

interface SidebarTabsProps {
  menuId: string;
  menu: Array<{
    id: string;
    label: string;
    labelMessage?: MessageReference;
    renderComponent: () => ReactNode;
  }>;

  selectedKey?: string;
  onSelectionChange?: (key: string) => void;

  /**
   * Swap the scrolling tab row for a single row showing the current tab. The whole row is a button
   * that opens the list of every tab. Avoids tab overflow entirely.
   */
  verticalTabs?: boolean;

  // New future options.
  isNested?: boolean;
  rootResource?: { id: string; type: string };
}

/** Widest the edge fade ever gets. It shrinks to nothing as the scroller reaches that edge. */
const FADE_WIDTH = 28;
/** Space reserved at the end of the row for the "more" button. */
const MORE_ZONE = 64;
/** A tab counts as hidden once less than this fraction of it is on screen. */
const VISIBLE_THRESHOLD = 0.6;

type TabMenuItem = SidebarTabsProps["menu"][number];

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function sameList(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, idx) => item === b[idx]);
}

function SidebarTabsContent(props: SidebarTabsProps) {
  const { resolveMessage } = useEditorI18n();
  const labels = props.menu.map((item) => resolveMessage(item.labelMessage, item.label));

  return props.verticalTabs ? (
    <CompactTabs {...props} labels={labels} />
  ) : (
    <ScrollingTabs {...props} labels={labels} />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Scrolling tabs
 *
 * Every tab stays mounted. The row scrolls (trackpad, touch, shift/vertical wheel, keyboard focus),
 * fades out at whichever edges still have content, and a "more" button lists whatever is out of view.
 * ----------------------------------------------------------------------------------------------- */

function ScrollingTabs({
  menu,
  menuId,
  labels,
  selectedKey,
  onSelectionChange,
}: SidebarTabsProps & { labels: string[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const overflowingRef = useRef(false);
  const rtlRef = useRef(false);
  const didReveal = useRef(false);

  const [overflowing, setOverflowing] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [moreTarget, setMoreTarget] = useState<HTMLDivElement | null>(null);

  const labelSignature = JSON.stringify(labels);

  /** How much content sits beyond each physical edge of the scroller. Direction aware. */
  const getEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return { left: 0, right: 0, start: 0, viewport: 0 };
    const viewport = scroller.clientWidth;
    const max = Math.max(0, scroller.scrollWidth - viewport);
    const sl = scroller.scrollLeft;
    const rtl = rtlRef.current;
    // RTL scrollLeft runs from -max (far end) to 0 (start).
    const left = rtl ? max + sl : sl;
    const right = rtl ? -sl : max - sl;
    return { left, right, start: left, viewport };
  }, []);

  const getTab = useCallback((id?: string): HTMLElement | null => {
    const list = listRef.current;
    if (!list || !id) return null;
    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    return tabs.find((el) => el.getAttribute("data-key") === id) ?? null;
  }, []);

  /** Edge fades follow the scroll position directly. Cheap enough for every scroll event. */
  const syncFades = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const { left, right } = getEdges();
    const zone = overflowingRef.current ? MORE_ZONE : 0;
    const rtl = rtlRef.current;
    const style = scroller.style;
    style.setProperty("--me-tabs-l-fade", `${Math.min(Math.max(left, 0), FADE_WIDTH)}px`);
    style.setProperty("--me-tabs-r-fade", `${Math.min(Math.max(right, 0), FADE_WIDTH)}px`);
    style.setProperty("--me-tabs-l-zone", `${rtl ? zone : 0}px`);
    style.setProperty("--me-tabs-r-zone", `${rtl ? 0 : zone}px`);
  }, [getEdges]);

  /** Which tabs are mostly off screen right now. Drives the "more" menu and its highlight. */
  const syncHidden = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const { start, viewport } = getEdges();
    const zone = overflowingRef.current ? MORE_ZONE : 0;
    const rtl = rtlRef.current;
    const winStart = start + (rtl ? zone : 0);
    const winEnd = start + viewport - (rtl ? 0 : zone);

    const next: string[] = [];
    for (const item of menu) {
      const tab = getTab(item.id);
      if (!tab) continue;
      const tabStart = tab.offsetLeft;
      const tabEnd = tabStart + tab.offsetWidth;
      const visible = Math.max(0, Math.min(tabEnd, winEnd) - Math.max(tabStart, winStart));
      if (tab.offsetWidth && visible / tab.offsetWidth < VISIBLE_THRESHOLD) next.push(item.id);
    }
    setHiddenIds((prev) => (sameList(prev, next) ? prev : next));
  }, [getEdges, getTab, menu]);

  /** Slide the underline under the selected tab. Positions are relative to the scrolling content. */
  const syncIndicator = useCallback(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const tab = getTab(selectedKey);
    if (!tab || !tab.offsetWidth) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.opacity = "1";
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    if (!indicator.hasAttribute("data-animate")) {
      // First placement lands instantly; later changes glide.
      requestAnimationFrame(() => indicator.setAttribute("data-animate", ""));
    }
  }, [getTab, selectedKey]);

  /** Bring a tab fully into the clear area (between the fades and clear of the "more" button). */
  const reveal = useCallback(
    (tab: HTMLElement | null, smooth: boolean) => {
      const scroller = scrollerRef.current;
      if (!scroller || !tab) return;
      const { left, right, start, viewport } = getEdges();
      const zone = overflowingRef.current ? MORE_ZONE : 0;
      const rtl = rtlRef.current;
      const inset = FADE_WIDTH + 4;
      const leftInset = inset + (rtl ? zone : 0);
      const rightInset = inset + (rtl ? 0 : zone);
      const tabStart = tab.offsetLeft;
      const tabEnd = tabStart + tab.offsetWidth;

      let delta = 0;
      if (tabStart < start + leftInset) delta = tabStart - (start + leftInset);
      else if (tabEnd > start + viewport - rightInset) delta = tabEnd - (start + viewport - rightInset);
      // Already at a scroll limit in that direction: nothing to do.
      if (!delta || (delta < 0 && left <= 0) || (delta > 0 && right <= 0)) return;

      const target = scroller.scrollLeft + delta;
      if (typeof scroller.scrollTo === "function") {
        scroller.scrollTo({ left: target, behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
      } else {
        scroller.scrollLeft = target;
      }
    },
    [getEdges]
  );

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list) return;

    rtlRef.current = getComputedStyle(scroller).direction === "rtl";
    const isOverflowing = list.offsetWidth > scroller.clientWidth + 1;
    if (isOverflowing !== overflowingRef.current) {
      overflowingRef.current = isOverflowing;
      setOverflowing(isOverflowing);
    }

    syncFades();
    syncHidden();
    syncIndicator();

    if (!didReveal.current) {
      const tab = getTab(selectedKey);
      if (tab?.offsetWidth) {
        didReveal.current = true;
        reveal(tab, false);
      }
    }
  }, [getTab, reveal, selectedKey, syncFades, syncHidden, syncIndicator]);

  // Measure whenever anything that affects widths changes, then keep watching for size changes
  // (container resize, late-arriving translated labels, fonts, React Aria's deferred collection).
  useLayoutEffect(() => {
    measure();
  }, [measure, overflowing, labelSignature]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(scroller);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  // Selecting a tab (by click, keyboard or the more menu) scrolls it into view.
  const previousKey = useRef(selectedKey);
  useEffect(() => {
    if (previousKey.current === selectedKey) return;
    previousKey.current = selectedKey;
    reveal(getTab(selectedKey), true);
  }, [getTab, reveal, selectedKey]);

  // Let a plain mouse wheel (vertical delta only) scroll the row sideways.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onWheel = (e: WheelEvent) => {
      if (!overflowingRef.current || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? scroller.clientWidth : 1;
      const dx = e.deltaY * unit * (rtlRef.current ? -1 : 1);
      const { left, right } = getEdges();
      if ((dx > 0 && right <= 0) || (dx < 0 && left <= 0)) return;
      e.preventDefault();
      scroller.scrollLeft += dx;
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [getEdges]);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const hiddenItems = useMemo(() => menu.filter((item) => hiddenSet.has(item.id)), [menu, hiddenSet]);
  const selectedHidden = !!selectedKey && hiddenSet.has(selectedKey);

  return (
    <>
      <Tabs
        className="w-full flex-1 overflow-hidden flex flex-col"
        key={menuId}
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange as any}
      >
        <div className="relative w-full tab-shadow">
          <div
            ref={scrollerRef}
            className="me-tabs-scroll w-full"
            onScroll={() => {
              syncFades();
              syncHidden();
            }}
            onFocus={(e) => {
              const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
              if (tab) reveal(tab, true);
            }}
          >
            <div
              className="relative w-max min-w-full"
              style={{ paddingInlineEnd: overflowing ? MORE_ZONE : 0 }}
            >
              <TabList ref={listRef} className="flex w-max text-sm whitespace-nowrap">
                {menu.map((item, idx) => (
                  <SidebarTab key={item.id} id={item.id}>
                    {labels[idx]}
                  </SidebarTab>
                ))}
              </TabList>
              <div
                ref={indicatorRef}
                aria-hidden
                className="me-tab-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 bg-me-primary-500"
                style={{ opacity: 0, width: 0 }}
              />
            </div>
          </div>
          <div
            ref={setMoreTarget}
            className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-1.5 pb-0.5"
          />
        </div>
        {menu.map((item) => (
          <TabPanel key={item.id} id={item.id} className="me-tab-panel flex-1 overflow-y-auto h-full">
            {selectedKey === item.id ? item.renderComponent() : null}
          </TabPanel>
        ))}
      </Tabs>

      {/* This is a bug where buttons that are not tabs can't be inside the <Tabs/> context, since the context is overwritten. */}
      {moreTarget
        ? createPortal(
            <MoreMenu
              visible={overflowing}
              highlight={selectedHidden}
              items={hiddenItems.length ? hiddenItems : menu}
              labels={Object.fromEntries(menu.map((item, idx) => [item.id, labels[idx]!]))}
              selectedKey={selectedKey}
              onSelectionChange={onSelectionChange}
            />,
            moreTarget
          )
        : null}
    </>
  );
}

/** Memoized Tab item — prevents new inline function props from re-triggering React Aria's
 * collection `setProps`/`queueUpdate` cycle on every parent render. */
const SidebarTab = memo(function SidebarTab({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Tab
      id={id}
      data-key={id}
      className={({ isSelected, isFocusVisible, isHovered, isPressed }) =>
        cn(
          "relative shrink-0 px-2 py-1 text-sm text-gray-600 select-none cursor-default",
          "transition-colors duration-150 focus:outline-none",
          isHovered && "text-black",
          isPressed && "bg-me-gray-100",
          isSelected && "text-black",
          isFocusVisible && "ring-2 ring-inset ring-me-primary-500 bg-me-gray-100"
        )
      }
    >
      {children}
    </Tab>
  );
});

const MoreMenu = createHideableComponent<
  {},
  {
    visible: boolean;
    highlight: boolean;
    items: TabMenuItem[];
    labels: Record<string, string>;
    selectedKey: string | undefined;
    onSelectionChange?: (key: string) => void;
  }
>(({ visible, highlight, items, labels, selectedKey, onSelectionChange }) => {
  const { locale, direction } = useEditorI18n();
  const t = useTranslations("components");
  return (
    <MenuTrigger>
      <Button
        aria-label={t("panels.moreTabs")}
        isDisabled={!visible}
        className={({ isFocusVisible, isPressed, isHovered }) =>
          cn(
            "group flex min-h-6 items-center gap-0.5 rounded border-none px-1.5 py-1 text-[10px] font-semibold uppercase outline-none",
            "transition-[opacity,transform,background-color,color,box-shadow] duration-200 ease-out",
            highlight ? "bg-me-primary-500 text-white" : "bg-gray-100 text-me-primary-600",
            isHovered && !highlight && "bg-me-gray-300",
            isHovered && highlight && "bg-me-primary-600",
            isPressed && "scale-95",
            isFocusVisible && "ring-2 ring-me-primary-500 ring-offset-1",
            visible
              ? "pointer-events-auto opacity-100 translate-x-0"
              : "pointer-events-none opacity-0 translate-x-1 scale-90"
          )
        }
      >
        {t("panels.more")}
        <svg
          aria-hidden
          viewBox="0 0 10 10"
          className="h-2 w-2 transition-transform duration-200 group-aria-expanded:rotate-180"
        >
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Button>
      <Popover lang={locale} dir={direction} className="me-tabs-popover" placement="bottom end" offset={4}>
        <Menu className="bg-white rounded shadow-lg flex flex-col gap-0.5 p-0.5 min-w-28 outline-none">
          {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              textValue={labels[item.id]}
              className={({ isFocused, isPressed }) =>
                cn(
                  "cursor-default rounded-sm p-1 text-sm outline-none transition-colors duration-100",
                  (isFocused || isPressed) && "bg-me-gray-100",
                  selectedKey === item.id && "ring ring-me-primary-500"
                )
              }
              onAction={() => onSelectionChange?.(item.id)}
            >
              {labels[item.id]}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Compact tabs (`verticalTabs`)
 *
 * One row showing the current tab. The whole row is a button; opening it lists every tab.
 * ----------------------------------------------------------------------------------------------- */

function CompactTabs({
  menu,
  labels,
  selectedKey,
  onSelectionChange,
}: SidebarTabsProps & { labels: string[] }) {
  const { locale, direction } = useEditorI18n();
  const t = useTranslations("components");
  const selected = menu.find((item) => item.id === selectedKey);
  const selectedLabel = selected ? labels[menu.indexOf(selected)] : undefined;

  return (
    <div className="w-full flex-1 overflow-hidden flex flex-col">
      <Select
        aria-label={t("panels.navigation")}
        className="w-full"
        selectedKey={selectedKey ?? null}
        onSelectionChange={(key) => {
          if (key != null) onSelectionChange?.(String(key));
        }}
      >
        <Button
          className={({ isFocusVisible, isHovered, isPressed }) =>
            cn(
              "group tab-shadow flex w-full items-center justify-between gap-3 bg-white px-3 py-2 text-start text-sm text-black",
              "outline-none transition-colors duration-150",
              isHovered && "bg-me-gray-100",
              isPressed && "bg-me-gray-300",
              isFocusVisible && "ring-2 ring-inset ring-me-primary-500"
            )
          }
        >
          <SelectValue className="truncate font-medium">
            {/* Keyed so the label does a tiny fade when it changes. */}
            {() => (
              <span key={selected?.id} className="me-tab-panel block truncate">
                {selectedLabel}
              </span>
            )}
          </SelectValue>
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="h-3 w-3 shrink-0 text-gray-600 transition-transform duration-200 ease-out group-hover:text-black group-aria-expanded:rotate-180"
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
        <Popover
          lang={locale}
          dir={direction}
          className="me-tabs-popover bg-white rounded-b shadow-lg"
          style={{ width: "var(--trigger-width)" }}
          offset={0}
        >
          <ListBox className="flex flex-col gap-0.5 overflow-auto p-0.5 outline-none" items={menu}>
            {(item) => (
              <ListBoxItem
                id={item.id}
                textValue={labels[menu.indexOf(item)]}
                className={({ isFocused, isSelected, isPressed }) =>
                  cn(
                    "flex cursor-default items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-sm outline-none",
                    "transition-colors duration-100",
                    (isFocused || isPressed) && "bg-me-gray-100",
                    isSelected && "font-medium text-me-primary-600"
                  )
                }
              >
                {({ isSelected }) => (
                  <>
                    <span className="truncate">{labels[menu.indexOf(item)]}</span>
                    <svg
                      aria-hidden
                      viewBox="0 0 12 12"
                      className={cn(
                        "h-3 w-3 shrink-0 transition-[opacity,transform] duration-150",
                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      )}
                    >
                      <path
                        d="M2.5 6.5 5 9l4.5-5.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </Select>
      {selected ? (
        <div
          key={selected.id}
          role="region"
          aria-label={selectedLabel}
          className="me-tab-panel flex-1 overflow-y-auto h-full"
        >
          {selected.renderComponent()}
        </div>
      ) : null}
    </div>
  );
}

export function SidebarTabs(props: SidebarTabsProps) {
  return (
    <ComponentI18nProvider>
      <SidebarTabsContent {...props} />
    </ComponentI18nProvider>
  );
}
