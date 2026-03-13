import { Card } from "./ui/Card";

export function AnalogGauge({ label, value, suffix = "%", tone = "cyan" }) {
  const color = tone === "green" ? "from-green-400 to-emerald-200" : tone === "red" ? "from-red-500 to-orange-200" : "from-cyan-400 to-blue-200";

  return (
    <Card className="min-h-[170px]">
      <p className="pixel-copy text-[10px] text-slate-300">{label}</p>
      <div className="mt-6 flex items-center justify-center">
        <div className={`flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-linear-to-br ${color} p-[1px]`}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/95">
            <span className="terminal-copy text-4xl text-white">{value}{suffix}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
