import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { useSyncStore } from "../store/useSyncStore";
import { getListenerSessionId } from "../utils/listenerSession";

export default function ListenerView() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const room = useSyncStore((state) => state.room);
  const sync = useSyncStore((state) => state.sync);
  const telemetry = useSyncStore((state) => state.telemetry);
  const logs = useSyncStore((state) => state.logs);
  const listenerId = getListenerSessionId();
  const joinedRef = useRef(false);
  const { publish } = useRealtimeSync(roomCode, "listener", { listenerId });

  useEffect(() => {
    if (telemetry.wsStatus !== "connected" || !listenerId) {
      joinedRef.current = false;
      return undefined;
    }

    if (joinedRef.current) {
      return undefined;
    }

    joinedRef.current = true;
    publish("join_room", { listener_id: listenerId });
    publish("listener_ready", { listener_id: listenerId });
  }, [listenerId, publish, telemetry.wsStatus]);

  const status = useMemo(() => {
    if (telemetry.wsStatus === "connecting") return "Connecting";
    if (telemetry.wsStatus === "connected") return "Connected";
    if (telemetry.wsStatus === "error") return "Error";
    return "Idle";
  }, [telemetry.wsStatus]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
        <Card glow="red" className="lg:col-span-8 border-[#ff0033]/30 bg-black/65">
          <CardHeader>
            <CardTitle>Listener Node</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-vt323 text-xl text-white/70">
            <div>ROOM {roomCode}</div>
            <div>STATUS {status}</div>
            <div>SOURCE {sync.videoUrl || room?.video_url || "WAITING FOR SOURCE"}</div>
            <div>MESSAGE {sync.latestMessage || "NO BROADCAST MESSAGE"}</div>
            <Button variant="secondary" onClick={() => navigate(`/listener/${roomCode}/screen`)}>
              OPEN FULL SCREEN
            </Button>
          </CardContent>
        </Card>

        <Card glow="none" className="lg:col-span-4 border-white/10 bg-black/65">
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-vt323 text-lg text-white/70">
            <div>LATENCY {telemetry.latencyMs}ms</div>
            <div>OFFSET {telemetry.syncOffsetMs}ms</div>
            <div>LISTENERS {telemetry.usersConnected}</div>
            <div>VIDEO {telemetry.videoState}</div>
            <div>AUDIO {telemetry.audioState}</div>
            <div className="max-h-48 overflow-auto border border-white/10 bg-black/40 p-3 text-sm">
              {logs.slice(-12).map((log, index) => (
                <div key={`${log}-${index}`}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
