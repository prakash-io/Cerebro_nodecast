import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { useSyncStore } from "../store/useSyncStore";

export default function NetworkDebug() {
  const { roomCode } = useParams();
  const telemetry = useSyncStore((state) => state.telemetry);
  const logs = useSyncStore((state) => state.logs);
  const sync = useSyncStore((state) => state.sync);
  const { publish } = useRealtimeSync(roomCode, "debug");

  const status = useMemo(() => {
    if (telemetry.wsStatus === "connecting") return "Connecting";
    if (telemetry.wsStatus === "connected") return "Connected";
    if (telemetry.wsStatus === "error") return "Error";
    return "Idle";
  }, [telemetry.wsStatus]);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-vt323 text-lg">
            <p>Status: {status}</p>
            <p>Latency: {telemetry.latencyMs}ms</p>
            <p>Sync Offset: {telemetry.syncOffsetMs}ms</p>
            <p>Users: {telemetry.usersConnected}</p>
            <p>Video: {telemetry.videoState}</p>
            <p>Audio: {telemetry.audioState}</p>
            <button
              type="button"
              className="rounded border border-[#00ffcc]/40 px-3 py-2 text-[#00ffcc]"
              onClick={() => publish("debug_ping", { playback_time: sync.playbackTime, is_playing: sync.isPlaying })}
            >
              Send Ping
            </button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] space-y-1 overflow-auto font-vt323 text-sm text-white/70">
              {logs.slice(-60).map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
