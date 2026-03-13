import { Activity, Radio, ShieldCheck, Users } from "lucide-react";

import { Card } from "./ui/Card";

const icons = {
  latency: Activity,
  network: Radio,
  users: Users,
  integrity: ShieldCheck,
};

export function StatStrip({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <Card key={item.label} className="flex items-center gap-4">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-3">
              <Icon className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="pixel-copy text-[10px] text-slate-400">{item.label}</p>
              <p className="terminal-copy text-3xl text-white">{item.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
