import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import GlitchText from "../animations/GlitchText";
import NeonGrid from "../animations/NeonGrid";
import ParticleBackground from "../animations/ParticleBackground";
import strangerThingsTrack from "../assets/audio/stranger_things.mp3";
import { Button } from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    let interactionBound = false;
    const startPlayback = () => {
      audio.play().catch(() => {});
    };

    startPlayback();

    const handleFirstInteraction = () => {
      startPlayback();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    audio.play().catch(() => {
      interactionBound = true;
      window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
      window.addEventListener("keydown", handleFirstInteraction, { once: true });
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (interactionBound) {
        window.removeEventListener("pointerdown", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      }
    };
  }, []);

  return (
    <div className="relative min-h-[78vh] overflow-hidden">
      <audio ref={audioRef} src={strangerThingsTrack} loop preload="auto" />
      <ParticleBackground />
      <NeonGrid />

      <div className="relative z-20 flex min-h-[78vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-[28px] border border-[#ff0033]/35 bg-black/45 p-8 text-center shadow-[0_0_40px_rgba(255,0,51,0.14)] backdrop-blur-sm md:p-14">
          <div className="font-vt323 text-lg tracking-[0.55em] text-white/55">HAWKINS LAB // CEREBRO UPLINK</div>
          <div className="mt-8">
            <GlitchText as="h1" text="CEREBRO CODE RED" className="text-5xl font-black text-[#ff0033] md:text-7xl" />
          </div>
          <p className="mx-auto mt-8 max-w-3xl font-vt323 text-2xl leading-relaxed text-white/72">
            Intercept transmissions from the Upside Down. Create a room, start synchronized playback, launch live video or voice broadcast, and send one-way messages to every listener.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => navigate("/create-room")}>
              CREATE ROOM
            </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/join-room")}>
            JOIN ROOM
          </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-black/45 p-4 font-vt323 text-xl text-white/58">
              BROADCASTER CONTROLS VIDEO, CALL, VOICE, AND MESSAGE TICKER.
            </div>
            <div className="rounded-md border border-white/10 bg-black/45 p-4 font-vt323 text-xl text-white/58">
              LISTENERS RECEIVE THE SAME BROADCAST WITHOUT CONTROL ACCESS.
            </div>
            <div className="rounded-md border border-white/10 bg-black/45 p-4 font-vt323 text-xl text-white/58">
              CREATE ROOM OPENS THE BROADCAST CONTROL PANEL IMMEDIATELY.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
