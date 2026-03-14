import { useEffect, useMemo, useRef, useState } from "react";
import { Mic } from "lucide-react";
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

  const pipRef = useRef(null);
  const audioRef = useRef(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);

  // Detect remote stream tracks
  useEffect(() => {
    const stream = rtc.remoteStream;
    if (!stream) {
      setHasRemoteVideo(false);
      setHasRemoteAudio(false);
      return;
    }
    const checkTracks = () => {
      setHasRemoteVideo(stream.getVideoTracks().length > 0);
      setHasRemoteAudio(stream.getAudioTracks().length > 0);
    };
    checkTracks();
    stream.addEventListener("addtrack", checkTracks);
    stream.addEventListener("removetrack", checkTracks);
    return () => {
      stream.removeEventListener("addtrack", checkTracks);
      stream.removeEventListener("removetrack", checkTracks);
    };
  }, [rtc.remoteStream]);

  // Attach remote video stream to PiP element
  useEffect(() => {
    const video = pipRef.current;
    if (!video) return;
    if (rtc.remoteStream && hasRemoteVideo) {
      video.srcObject = rtc.remoteStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [rtc.remoteStream, hasRemoteVideo, telemetry.videoState]);

  // Always play remote stream audio through hidden audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (rtc.remoteStream && hasRemoteAudio) {
      audio.srcObject = rtc.remoteStream;
      audio.play().catch(() => {});
    } else {
      audio.srcObject = null;
    }
  }, [rtc.remoteStream, hasRemoteAudio, hasRemoteVideo]);

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

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#ff0033]/30 bg-black/70 shadow-[0_0_30px_rgba(255,0,51,0.12)]">
        <VideoSyncPlayer
          src={effectiveSync.videoUrl}
          sync={effectiveSync}
        />
        {/* PiP overlay — broadcaster camera (video) */}
        {hasRemoteVideo && telemetry.videoState === "live" && (
          <div className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-xl border-2 border-[#00ff66]/50 shadow-[0_0_20px_rgba(0,255,102,0.35)]">
            <video
              ref={pipRef}
              autoPlay
              playsInline
              muted
              className="h-[120px] w-[170px] object-cover"
            />
          </div>
        )}
        {/* Audio-only indicator */}
        {telemetry.videoState !== "live" && telemetry.audioState === "live" && (
          <div className="absolute bottom-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#00ff66]/50 bg-black/70 shadow-[0_0_20px_rgba(0,255,102,0.35)]">
            <Mic className="h-6 w-6 animate-pulse text-[#00ff66]" />
          </div>
        )}
        {/* Hidden audio element — always plays remote stream audio */}
        <audio ref={audioRef} autoPlay hidden />
      </div>
    </div>
  );
}
