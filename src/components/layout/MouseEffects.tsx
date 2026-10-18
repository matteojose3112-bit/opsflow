import { useEffect, useRef } from "react";

function MouseEffects() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -100, y: -100 });
  const ringPosition = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let frame = 0;
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>("a, button, [data-magnetic]"),
    );

    const move = (event: PointerEvent) => {
      position.current = { x: event.clientX, y: event.clientY };
      interactive.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const range = Math.max(rect.width, rect.height) * 1.15;
        const distance = Math.hypot(dx, dy);
        if (distance < range) {
          const strength = 0.12 * (1 - distance / range);
          element.style.setProperty("--ops-magnetic-x", `${dx * strength}px`);
          element.style.setProperty("--ops-magnetic-y", `${dy * strength}px`);
          element.classList.add("ops-magnetic-active");
        } else {
          element.style.setProperty("--ops-magnetic-x", "0px");
          element.style.setProperty("--ops-magnetic-y", "0px");
          element.classList.remove("ops-magnetic-active");
        }
      });
    };

    const render = () => {
      ringPosition.current.x += (position.current.x - ringPosition.current.x) * 0.14;
      ringPosition.current.y += (position.current.y - ringPosition.current.y) * 0.14;
      dot.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringPosition.current.x}px, ${ringPosition.current.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    const enter = () => ring.classList.add("is-hovering");
    const leave = () => ring.classList.remove("is-hovering");

    window.addEventListener("pointermove", move, { passive: true });
    interactive.forEach((element) => {
      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
    });
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", move);
      interactive.forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
        element.style.removeProperty("--ops-magnetic-x");
        element.style.removeProperty("--ops-magnetic-y");
        element.classList.remove("ops-magnetic-active");
      });
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="ops-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="ops-cursor-dot" aria-hidden="true" />
    </>
  );
}

export default MouseEffects;
