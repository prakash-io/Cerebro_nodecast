import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { PhoneOff, Video, VideoOff, Phone, Mic, MicOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { GlitchTitle } from "../components/GlitchTitle";
import { VideoSyncPlayer } from "../components/VideoSyncPlayer";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import TerminalConsole from "../components/ui/TerminalConsole";
import { useBroadcastRTC } from "../hooks/useBroadcastRTC";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { useSyncStore } from "../store/useSyncStore";

function LatencyGraph({ points }) {
  const path = useMemo(() => {
    if (!points.length) {
      return "";
    }
    const maxValue = Math.max(...points.map((point) => point.value), 1);
    return points
      .map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100;
        const y = 100 - (point.value / maxValue) * 100;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [points]);

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-full overflow-visible">
      <defs>
        <linearGradient id="latency-line" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6b81" />
          <stop offset="100%" stopColor="#ff0033" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#latency-line)" strokeWidth="2" />
    </svg>
  );
}

function BroadcasterPanel() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const publishRef = useRef(() => false);
  const selfPreviewRef = useRef(null);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const room = useSyncStore((state) => state.room);
  const sync = useSyncStore((state) => state.sync);
  const telemetry = useSyncStore((state) => state.telemetry);
  const logs = useSyncStore((state) => state.logs);
  const updateTelemetry = useSyncStore((state) => state.updateTelemetry);
  const deferredLogs = useDeferredValue(logs);

  const rtc = useBroadcastRTC({
    mode: "broadcaster",
    onLog: () => {},
    onMediaStatus: ({ audioEnabled, videoEnabled, liveActive }) => {
      updateTelemetry({
        audioState: audioEnabled ? "live" : "idle",
        videoState: videoEnabled ? "live" : "idle",
      });
      publishRef.current("media_status", {
        audio_enabled: audioEnabled,
        video_enabled: videoEnabled,
        live_active: liveActive,
      });
    },
    publish: (...args) => publishRef.current(...args),
  });

  const { publish } = useRealtimeSync(roomCode, "broadcaster", {
    onEvent: rtc.handleSocketEvent,
  });

  publishRef.current = publish;

  useEffect(() => {
    if (sync.videoUrl && !mediaUrlInput) {
      startTransition(() => setMediaUrlInput(sync.videoUrl));
    }
  }, [mediaUrlInput, sync.videoUrl]);

  // Attach local stream to self-preview PiP
  useEffect(() => {
    const video = selfPreviewRef.current;
    if (!video) return;
    if (rtc.localStream) {
      video.srcObject = rtc.localStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [rtc.localStream, cameraOn]);

  useEffect(() => {
    if (telemetry.wsStatus !== "connected" || !playerRef.current || !sync.videoUrl) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const video = playerRef.current;
      if (!video) {
        return;
      }
      publish("sync_state", {
        playback_time: video.currentTime,
        is_playing: !video.paused,
        video_url: sync.videoUrl,
        media_mode: "video_url",
      });
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [publish, sync.videoUrl, telemetry.wsStatus]);

  const connectedListeners = room?.listener_count ?? telemetry.usersConnected ?? 0;
  const listeners = room?.listeners || [];
  const terminalLines = useMemo(() => {
    const sourceLabel = rtc.localStream ? "LIVE CAMERA FEED" : sync.videoUrl || "NONE";
    return [
      `NODE ${roomCode}`,
      `WS ${telemetry.wsStatus.toUpperCase()}`,
      `SOURCE ${sourceLabel}`,
      `LISTENERS ${connectedListeners}`,
      `AUDIO ${telemetry.audioState.toUpperCase()}`,
      `VIDEO ${telemetry.videoState.toUpperCase()}`,
      ...deferredLogs.slice(-10),
    ];
  }, [connectedListeners, deferredLogs, roomCode, rtc.localStream, sync.videoUrl, telemetry.audioState, telemetry.videoState, telemetry.wsStatus]);

  const handleLoadMedia = useCallback((event) => {
    event?.preventDefault();
    const nextUrl = mediaUrlInput.trim();
    if (!nextUrl) {
      return;
    }

    publish("load_video", {
      video_url: nextUrl,
      media_mode: "video_url",
    });
  }, [mediaUrlInput, publish]);

  const handleSendTicker = useCallback((event) => {
    event?.preventDefault();
    const message = messageInput.trim();
    if (!message) {
      return;
    }

    publish("broadcast_message", { message });
    setMessageInput("");
  }, [messageInput, publish]);

  const startWebcamBroadcast = useCallback(async () => {
    await rtc.startLocalBroadcast({ video: true, audio: true });
    setCameraOn(true);
    setMicOn(true);
    await rtc.broadcastToListeners(listeners.map((listener) => listener.listener_id));
    publish("sync_state", { media_mode: "live" });
  }, [listeners, publish, rtc]);

  const startVoiceBroadcast = useCallback(async () => {
    await rtc.startLocalBroadcast({ video: true, audio: true });
    // Disable video tracks immediately for voice-only start
    rtc.toggleVideo(false);
    setCameraOn(false);
    setMicOn(true);
    await rtc.broadcastToListeners(listeners.map((listener) => listener.listener_id));
    publish("sync_state", { media_mode: "live" });
  }, [listeners, publish, rtc]);

  const handleToggleCamera = useCallback(() => {
    const next = !cameraOn;
    setCameraOn(next);
    rtc.toggleVideo(next);
    publishRef.current("media_status", {
      audio_enabled: micOn,
      video_enabled: next,
      live_active: true,
    });
  }, [cameraOn, micOn, rtc]);

  const handleToggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    rtc.toggleAudio(next);
    publishRef.current("media_status", {
      audio_enabled: next,
      video_enabled: cameraOn,
      live_active: true,
    });
  }, [cameraOn, micOn, rtc]);

  const stopLiveBroadcast = useCallback(() => {
    rtc.stopLocalBroadcast();
    setCameraOn(false);
    setMicOn(false);
    publish("media_status", {
      audio_enabled: false,
      video_enabled: false,
      live_active: false,
    });
    publish("sync_state", { media_mode: "video_url" });
  }, [publish, rtc]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(120,0,20,0.35),_transparent_40%),linear-gradient(180deg,#090909_0%,#050505_100%)] p-4 md:p-6">
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card glow="red" className="overflow-hidden border-[#ff0033]/40 bg-black/70 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#ff0033]/30 bg-[#120608]/90 px-4 py-3">
              <GlitchTitle title="CEREBRO BROADCAST" className="text-2xl text-[#ffedea]" />
              <div className="font-vt323 text-xl tracking-[0.3em] text-[#ff6b81]">ROOM {roomCode}</div>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_50%,transparent_50%)] bg-[length:100%_6px] opacity-20" />
              <VideoSyncPlayer
                src={sync.videoUrl}
                sync={{ ...sync, ...telemetry }}
                isBroadcaster
                onAction={(action, playbackTime, isPlaying) => {
                  publish(action, {
                    playback_time: playbackTime,
                    is_playing: isPlaying,
                    video_url: sync.videoUrl,
                    media_mode: rtc.localStream ? "live" : "video_url",
                  });
                }}
                videoElementRef={playerRef}
              />
              {/* Broadcaster self-preview PiP */}
              {rtc.localStream && cameraOn && (
                <div className="absolute right-3 top-3 z-20 overflow-hidden rounded-xl border-2 border-[#00ff66]/50 shadow-[0_0_16px_rgba(0,255,102,0.3)]">
                  <video
                    ref={selfPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-[100px] w-[140px] object-cover"
                  />
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card glow="none" className="border-[#ff0033]/30 bg-black/65">
              <CardHeader>
                <CardTitle>Transmission Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLoadMedia} className="flex flex-col gap-4">
                  <Input
                    value={mediaUrlInput}
                    onChange={(event) => setMediaUrlInput(event.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                  <Button type="submit" variant="primary" disabled={!mediaUrlInput.trim()}>
                    LOAD VIDEO URL
                  </Button>
                </form>
                {rtc.localStream ? (
                  <div className="flex items-center justify-center gap-4">
                    {/* Camera toggle */}
                    <button
                      onClick={handleToggleCamera}
                      className={`group flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        cameraOn
                          ? "border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] shadow-[0_0_14px_rgba(0,255,102,0.3)] hover:bg-[#00ff66]/30"
                          : "border-white/30 bg-white/10 text-white/50 hover:border-white/50 hover:bg-white/20"
                      }`}
                      title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
                    >
                      {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </button>
                    {/* Mic toggle */}
                    <button
                      onClick={handleToggleMic}
                      className={`group flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        micOn
                          ? "border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] shadow-[0_0_14px_rgba(0,255,102,0.3)] hover:bg-[#00ff66]/30"
                          : "border-white/30 bg-white/10 text-white/50 hover:border-white/50 hover:bg-white/20"
                      }`}
                      title={micOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </button>
                    {/* End call */}
                    <button
                      onClick={stopLiveBroadcast}
                      className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 bg-red-600/80 text-white shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)]"
                      title="End Call"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" className="min-w-0 flex-1 basis-[140px]" onClick={startWebcamBroadcast}>
                      <Video className="mr-2 h-4 w-4" /> VIDEO CALL
                    </Button>
                    <Button variant="secondary" className="min-w-0 flex-1 basis-[140px]" onClick={startVoiceBroadcast}>
                      <Phone className="mr-2 h-4 w-4" /> VOICE ONLY
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card glow="none" className="border-white/10 bg-black/65">
              <CardHeader>
                <CardTitle>Broadcast Ticker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSendTicker} className="flex flex-col gap-4">
                  <Input
                    maxLength={280}
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="Incoming signal detected..."
                  />
                  <Button type="submit" variant="secondary" disabled={!messageInput.trim()}>
                    SEND MESSAGE
                  </Button>
                </form>
                <div className="rounded-md border border-[#ff0033]/20 bg-black/50 px-4 py-3 font-vt323 text-xl tracking-wide text-[#ff6b81]">
                  {sync.latestMessage || "NO ACTIVE TICKER MESSAGE"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card glow="none" className="border-white/10 bg-black/65">
            <CardHeader>
              <CardTitle>Network Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-vt323 text-lg text-white/70">
              <div className="grid grid-cols-2 gap-3">
                <div>WS: {telemetry.wsStatus}</div>
                <div>LATENCY: {telemetry.latencyMs}ms</div>
                <div>OFFSET: {telemetry.syncOffsetMs}ms</div>
                <div>LISTENERS: {connectedListeners}</div>
                <div>VIDEO: {telemetry.videoState}</div>
                <div>AUDIO: {telemetry.audioState}</div>
              </div>
              <LatencyGraph points={telemetry.latencyHistory} />
              <Button variant="ghost" onClick={() => navigate(`/network-debug/${roomCode}`)}>
                OPEN FULL DEBUG PANEL
              </Button>
            </CardContent>
          </Card>

          <Card glow="none" className="border-[#ff0033]/30 bg-black/65">
            <CardHeader>
              <CardTitle>Listener Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              {listeners.length ? (
                <div className="max-h-[280px] space-y-3 overflow-auto pr-1">
                  {listeners.map((listener, index) => (
                    <div key={listener.listener_id} className="rounded-md border border-[#ff0033]/20 bg-black/40 p-3 font-vt323 text-lg">
                      <div className="flex items-center justify-between text-[#ff6b81]">
                        <span>LISTENER {index + 1}</span>
                        <span className="text-[#ff0033]">ONLINE</span>
                      </div>
                      <div className="mt-2 text-white/60">
                        <div className="truncate">ID {listener.listener_id}</div>
                        <div>JOIN {new Date(listener.joined_at).toLocaleTimeString()}</div>
                        <div>PING {new Date(listener.last_ping).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-white/10 p-6 text-center font-vt323 text-xl text-white/40">
                  NO LISTENERS LOCKED ON
                </div>
              )}
            </CardContent>
          </Card>

          <div className="min-h-[320px]">
            <TerminalConsole
              initialOutput={terminalLines}
              inputEnabled={false}
              onCommand={(command) => {
                if (command === "sync force" && playerRef.current && sync.videoUrl) {
                  publish("sync_state", {
                    playback_time: playerRef.current.currentTime,
                    is_playing: !playerRef.current.paused,
                    video_url: sync.videoUrl,
                    media_mode: "video_url",
                  });
                  return "FORCING GLOBAL SYNCHRONIZATION";
                }
                if (command === "kill") {
                  navigate("/");
                  return "TERMINATING CONNECTION";
                }
                return "COMMAND INVALID";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BroadcasterPanel);
