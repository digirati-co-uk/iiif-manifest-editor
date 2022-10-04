import styled, { css } from "styled-components";
import {
  createRef,
  forwardRef,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  RefObject,
  UIEventHandler,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { DownIcon } from "@/icons/DownIcon";

export const AccordionContainer = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const ItemRow = styled.div`
  background: #fff;
  position: relative;
  border-bottom: 1px solid #d0d0d0;
  border-top: 1px solid #d0d0d0;

  & ~ & {
    border-top: none;
  }
`;

const ItemLabel = styled.button`
  color: inherit;
  text-rendering: geometricPrecision;
  border: none;
  text-align: left;
  background: transparent;
  font: inherit;
  text-transform: uppercase;
  padding: 0.6em 1.2em;
  flex: 1;
  font-size: 0.8em;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
  overflow: hidden;
`;

const ItemCollapse = styled.div`
  font-size: 1.4em;
  padding-right: 0.3em;
  display: flex;
  align-items: center;
`;

const ItemBodyInner = styled.div<{ $full?: boolean }>`
  ${(props) =>
    props.$full
      ? css`
          margin: 0;
        `
      : css`
          margin: 1em 1em 1.5em;
        `}
`;

const ItemBody = styled.div<{
  $hidden?: boolean;
  $initial?: boolean;
  $maxHeight?: number;
  $scrolled?: boolean;
}>`
  transition: height 0.2s, box-shadow 0.2s;
  overflow: hidden;

  ${(props) =>
    props.$scrolled
      ? css`
          box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0.1);
        `
      : css`
          box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0);
        `}

  ${(props) =>
    props.$initial
      ? css`
          position: absolute;
          opacity: 0;
          height: auto;
        `
      : css`
          max-height: ${props.$maxHeight || "120"}px;
          overflow: auto;
        `}
`;

const ItemHeading = styled.div<{ $open?: boolean }>`
  position: sticky;
  display: flex;
  top: 0;
  background: #fff;
  min-width: 0;
  width: 100%;
  color: #757575;
  &:hover {
    color: #333;
  }

  ${(props) =>
    props.$open &&
    css`
      color: #333;
      &:after {
        content: "";
        height: 1px;
        background: #eee;
        position: absolute;
        top: 100%;
        left: 0.5em;
        right: 0.5em;
      }
    `}
`;

function runWhenEntered(element: HTMLElement, callback: () => void) {
  const parent = element.closest(".transition");
  if (parent && !parent.classList.contains("transition-entered")) {
    const style = window.getComputedStyle(parent);
    const t = setTimeout(
      callback,
      parseFloat(style.transitionDuration) * (style.transitionDuration.endsWith("ms") ? 1 : 1000) || 0
    );
    return () => {
      clearTimeout(t);
    };
  } else {
    callback();
  }
}

interface AccordionItemProps {
  label: string;
  children: ReactNode;
  initialOpen?: boolean;
  maxHeight?: number;
  fullWidth?: boolean;
  onChange?: (value: boolean) => void;
}
interface AccordionItemRef {
  open(): void;
  close(): void;
  toggle(): void;
  focus(): void;
  button?: RefObject<HTMLButtonElement>;
}

const noop = (() => void 0) as any;

export const AccordionItem = forwardRef<AccordionItemRef, AccordionItemProps>(function AccordionItem(props, ref) {
  const content = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  const [open, setIsOpen] = useState<boolean>(props.initialOpen || false);
  const onChange = props.onChange || noop;
  const toggle = () => {
    onChange(!open);
    setIsOpen((o) => !o);
  };
  const [_height, setHeight] = useState<number | undefined>(undefined);
  const maxHeight = props.maxHeight || 800;
  const initial = typeof _height === "undefined";
  const height = Math.min(_height || 0, maxHeight);
  const [scrolled, setScrolled] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      onChange(true);
      setIsOpen(true);
    },
    close() {
      onChange(false);
      setIsOpen(false);
    },
    toggle() {
      toggle();
    },
    focus() {
      if (btn.current) {
        btn.current.focus();
      }
    },
    button: btn,
  }));

  useLayoutEffect(() => {
    if (content.current && initial) {
      if (content.current) {
        return runWhenEntered(content.current, () => {
          if (content.current) {
            const bounds = content.current.getBoundingClientRect();
            setHeight(bounds.height);
          }
        });
      }
    }
  }, [initial]);

  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLDivElement).scrollTop > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <ItemRow>
      <ItemHeading $open={open}>
        <ItemLabel ref={btn} onClick={toggle}>
          {props.label}
        </ItemLabel>
        <ItemCollapse onClick={toggle}>
          <DownIcon rotate={open ? 0 : 90} />
        </ItemCollapse>
      </ItemHeading>
      <ItemBody
        onScroll={onScroll}
        ref={content}
        $initial={initial && !open}
        $maxHeight={maxHeight}
        $scrolled={scrolled}
        style={{
          height: initial ? undefined : open && height ? height : 0,
          transitionDuration: `${Math.max(200, height * 1.4)}ms`,
        }}
      >
        <ItemBodyInner $full={props.fullWidth}>{props.children}</ItemBodyInner>
      </ItemBody>
    </ItemRow>
  );
});

interface AccordionProps {
  singleMode?: boolean;
  items: Array<AccordionItemProps>;
}

export function Accordion(props: AccordionProps) {
  const itemsLength = props.items.length;
  const [elRefs, setElRefs] = useState<RefObject<AccordionItemRef>[]>([]);
  const current = useRef(-1);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    const currentEl = document.activeElement;
    const currentIndex = elRefs.findIndex((r) => r.current?.button?.current === currentEl);
    if (currentIndex === -1) {
      return;
    }

    switch (e.code) {
      case "ArrowDown": {
        if (currentIndex !== itemsLength - 1) {
          const next = currentIndex + 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
      // Focus previous
      case "ArrowUp": {
        if (currentIndex !== 0) {
          const next = currentIndex - 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
      // Focus next
      case "ArrowLeft": {
        // Close current
        const el = elRefs[currentIndex];
        if (el && el.current) {
          el.current.close();
        }
        break;
      }
      // Open current
      case "ArrowRight": {
        // Close current
        const el = elRefs[currentIndex];
        if (el && el.current) {
          el.current.open();
        }
        break;
      }
    }
  };

  const onChange = (key: number, isOpen: boolean) => {
    if (props.singleMode && isOpen && key !== current.current) {
      current.current = key;
      for (let i = 0; i < elRefs.length; i++) {
        const ref = elRefs[i];
        if (i === key) {
          continue;
        }
        ref.current?.close();
      }
    }
  };

  useEffect(() => {
    // add or remove refs
    setElRefs((elRefs) =>
      Array(itemsLength)
        .fill(0)
        .map((_, i) => elRefs[i] || createRef())
    );
  }, [itemsLength]);

  return (
    <AccordionContainer onKeyDown={onKeyDown}>
      {props.items.map((item, key) => (
        <AccordionItem key={key} ref={elRefs[key]} {...item} onChange={(isOpen) => onChange(key, isOpen)}>
          {item.children}
        </AccordionItem>
      ))}
    </AccordionContainer>
  );
}
