import { terminalCommands } from "../utils/constants";
import { Card } from "./ui/Card";

export function TerminalConsole({ logs }) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between border-b border-cyan-400/15 pb-4">
        <div>
          <p className="pixel-copy text-[10px] text-cyan-300">COMMAND CONSOLE</p>
          <p className="terminal-copy text-xl text-white">Available: {terminalCommands.join(" / ")}</p>
        </div>
      </div>
      <div className="scrollbar-thin mt-4 max-h-64 space-y-2 overflow-auto terminal-copy text-2xl text-green-300">
        {logs.length ? logs.map((log) => <p key={log}>{log}</p>) : <p>standby awaiting input...</p>}
      </div>
    </Card>
  );
}
