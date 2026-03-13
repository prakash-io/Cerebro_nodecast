import { useRef } from "react";
import gsap from "gsap";

import { Button } from "./ui/Button";

export function MagneticButton(props) {
  const ref = useRef(null);

  const move = (event) => {
    const bounds = ref.current.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    gsap.to(ref.current, { x: x * 0.14, y: y * 0.14, duration: 0.2 });
  };

  const reset = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.3 });
  };

  return <Button ref={ref} onPointerMove={move} onPointerLeave={reset} {...props} />;
}
