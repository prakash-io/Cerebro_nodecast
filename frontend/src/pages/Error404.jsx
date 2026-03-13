import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function Error404() {
  const navigate = useNavigate();
  const error = useRouteError?.() ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-orbitron text-[#ff0033]">
      <div className="crt-overlay pointer-events-none z-50" />
      <div className="noise-bg pointer-events-none z-40" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="font-press-start text-6xl tracking-widest text-[#ff0033] drop-shadow-[0_0_30px_rgba(255,0,51,0.5)] md:text-8xl">
          404
        </div>

        <div className="font-vt323 text-3xl tracking-[0.3em] text-[#ff6b81] md:text-4xl">
          HAWKINS LAB NAVIGATION ERROR
        </div>

        <div className="max-w-md font-vt323 text-xl text-white/50">
          {error?.statusText || error?.message || "The signal has been lost. This frequency does not exist in the current dimension."}
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => navigate("/")} magnetic={false}>
            RETURN TO BASE
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate(-1)} magnetic={false}>
            GO BACK
          </Button>
        </div>

        <div className="mt-8 font-vt323 text-lg text-white/20">
          ERROR CODE: DIMENSION_NOT_FOUND
        </div>
      </div>
    </div>
  );
}
