import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    // Load slim bundle for faster initialization
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: 'transparent',
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: '#ff0033',
            },
            links: {
              enable: false,
            },
            move: {
              enable: true,
              direction: 'top',
              random: true,
              speed: 1.5,
              straight: false,
              outModes: {
                default: 'out',
              },
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 60,
            },
            opacity: {
              value: { min: 0.1, max: 0.5 },
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
              },
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 4 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
