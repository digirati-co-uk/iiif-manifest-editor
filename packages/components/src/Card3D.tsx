import { useLayoutEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export function Card3D({
  className,
  shouldTranslate,
  children,
  ...props
}: { shouldTranslate?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!outer.current || !inner.current) return;

    let bounds: DOMRect;
    function rotateToMouse(e: MouseEvent) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2,
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      if (shouldTranslate) {
        outer.current!.style.transform = `
        scale3d(1.07, 1.07, 1.07)
        rotate3d(
          ${center.y / 100},
          ${-center.x / 100},
          0,
          ${Math.log(distance) * 2}deg
        )
      `;
      }

      inner.current!.style.backgroundImage = `
        radial-gradient(
          circle at
          ${center.x * 2 + bounds.width / 2}px
          ${center.y * 2 + bounds.height / 2}px,
          #ffffff66,
          #ffffff00
        )
      `;
    }

    function reset() {
      outer.current!.style.transform = "";
      inner.current!.style.backgroundImage = "";
    }

    let isActive = false;

    const mouseenter = () => {
      bounds = outer.current!.getBoundingClientRect();
      isActive = true;
    };

    const mouseleave = () => {
      isActive = false;
      reset();
    };

    const mousemove = (e: MouseEvent) => {
      if (!isActive) return;
      rotateToMouse(e);
    };

    outer.current.addEventListener("mouseenter", mouseenter);
    outer.current.addEventListener("mouseleave", mouseleave);
    outer.current.addEventListener("mousemove", mousemove);

    return () => {
      outer.current!.removeEventListener("mouseenter", mouseenter);
      outer.current!.removeEventListener("mouseleave", mouseleave);
      outer.current!.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return (
    <div
      ref={outer}
      className={twMerge(
        //
        "relative transition-all hover:duration-50",
        shouldTranslate && "hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-all"
        style={{
          backgroundImage: "radial-gradient(circle at 50% -20%, #ffffff00, #ffffff00)",
        }}
        ref={inner}
      />
    </div>
  );
}
