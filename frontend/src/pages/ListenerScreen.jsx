import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { VideoSyncPlayer } from "../components/VideoSyncPlayer";
import { Button } from "../components/ui/Button";
import { useBroadcastRTC } from "../hooks/useBroadcastRTC";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { useSyncStore } from "../store/useSyncStore";
import { getListenerSessionId } from "../utils/listenerSession";

export default function ListenerScreen() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const publishRef = useRef(() => false);
  const room = useSyncStore((state) => state.room);
  const sync = useSyncStore((state) => state.sync);
  const telemetry = useSyncStore((state) => state.telemetry);
  const listenerId = getListenerSessionId();
  const joinedRef = useRef(false);

  const rtc = useBroadcastRTC({
    mode: "listener",
    listenerId,
    publish: (...args) => publishRef.current(...args),
  });

  const { publish } = useRealtimeSync(roomCode, "listener", {
    listenerId,
    onEvent: rtc.handleSocketEvent,
  });

  publishRef.current = publish;

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

  const effectiveSync = {
    ...sync,
    ...telemetry,
    videoUrl: sync.videoUrl || room?.video_url || "",
    playbackTime: sync.playbackTime ?? room?.playback_time ?? 0,
    isPlaying: typeof sync.isPlaying === "boolean" ? sync.isPlaying : Boolean(room?.is_playing),
  };

  const status = useMemo(() => {
    if (telemetry.wsStatus === "connecting") return "Connecting";
    if (telemetry.wsStatus === "connected") return "Connected";
    if (telemetry.wsStatus === "error") return "Error";
    return "Idle";
  }, [telemetry.wsStatus]);

  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 pb-4">
        <div className="font-vt323">
          <div className="text-3xl tracking-widest text-[#ff0033]">LISTENER SCREEN</div>
          <div className="text-lg text-white/60">ROOM {roomCode} | WS {status}</div>
          <div className="text-xl text-[#ff0033]">{effectiveSync.latestMessage || "STANDBY FOR BROADCASTER MESSAGE"}</div>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/listener/${roomCode}`)}>
          NODE PANEL
        </Button>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#ff0033]/30 bg-black/70 shadow-[0_0_30px_rgba(255,0,51,0.12)]">
        <VideoSyncPlayer
          src={rtc.remoteStream ? "" : effectiveSync.videoUrl}
          stream={rtc.remoteStream}
          sync={effectiveSync}
        />
      </div>
    </div>
  );
}
