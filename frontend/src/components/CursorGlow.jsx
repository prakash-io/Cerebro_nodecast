import { useEffect, useState } from "react";

export function CursorGlow() {
  const [point, setPoint] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handler = (event) => setPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return <div className="pointer-events-none fixed z-[60] h-40 w-40 rounded-full bg-red-500/12 blur-3xl transition-transform duration-100" style={{ transform: `translate(${point.x - 80}px, ${point.y - 80}px)` }} />;
}
