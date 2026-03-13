import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export function ParticlesField() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="dust-field"
      init={init}
      options={{
        fullScreen: { enable: false },
        background: { color: "transparent" },
        particles: {
          number: { value: 36 },
          color: { value: ["#ff0033", "#00ffcc", "#00a6ff"] },
          opacity: { value: { min: 0.12, max: 0.4 } },
          move: { enable: true, speed: 0.6 },
          size: { value: { min: 1, max: 3 } },
        },
      }}
      className="absolute inset-0"
    />
  );
}
