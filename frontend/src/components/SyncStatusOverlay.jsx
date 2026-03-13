export function SyncStatusOverlay({ latencyMs, syncOffsetMs }) {
  const state = Math.abs(syncOffsetMs) < 20 ? "green" : Math.abs(syncOffsetMs) < 80 ? "yellow" : "red";
  const accent = state === "green" ? "text-green-300 border-green-400/20" : state === "yellow" ? "text-yellow-300 border-yellow-400/20" : "text-red-300 border-red-400/20";

  return (
    <div className={`absolute right-4 top-4 rounded-2xl border bg-black/55 px-4 py-3 backdrop-blur ${accent}`}>
      <p className="pixel-copy text-[9px]">SYNC MONITOR</p>
      <p className="terminal-copy text-xl">OFFSET: {syncOffsetMs >= 0 ? "+" : ""}{syncOffsetMs}ms</p>
      <p className="terminal-copy text-xl">LATENCY: {latencyMs}ms</p>
    </div>
  );
}
