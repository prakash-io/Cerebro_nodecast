import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GlitchTitle({ title, subtitle }) {
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(titleRef.current, {
        textShadow: "0 0 18px rgba(255,0,51,0.95), 0 0 40px rgba(0,166,255,0.55)",
        repeat: -1,
        yoyo: true,
        duration: 0.12,
        ease: "power2.inOut",
      });
      gsap.to(titleRef.current, {
        x: () => gsap.utils.random(-2, 2),
        repeat: -1,
        yoyo: true,
        duration: 0.08,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="max-w-4xl">
      <p className="pixel-copy text-[10px] uppercase tracking-[0.45em] text-cyan-300">{subtitle}</p>
      <h1 ref={titleRef} className="mt-4 text-4xl font-black uppercase tracking-[0.32em] text-white md:text-7xl">
        {title}
      </h1>
    </div>
  );
}
