import { motion } from "framer-motion";

const lines = [
  "Initializing Cerebro...",
  "Scanning frequencies...",
  "Connecting nodes...",
  "Synchronizing signals...",
];

export function BootScreen({ mode = "startup" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="crt-panel max-w-2xl rounded-[32px] border border-red-500/25 px-8 py-10">
        <p className="pixel-copy text-[10px] text-red-400">HAWKINS LAB // {mode.toUpperCase()}</p>
        <h1 className="mt-5 text-3xl font-black uppercase tracking-[0.4em] text-white md:text-5xl">Code Red</h1>
        <div className="mt-8 space-y-3 terminal-copy text-2xl text-cyan-200">
          {lines.map((line, index) => (
            <motion.p key={line} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.3, duration: 0.45 }}>
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}
