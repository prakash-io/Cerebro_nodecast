import { create } from "zustand";

const initialTelemetry = {
  latencyMs: 0,
  syncOffsetMs: 0,
  connectionStrength: 87,
  usersConnected: 0,
  wsStatus: "idle",
  videoState: "idle",
  audioState: "idle",
  latencyHistory: [],
};

const initialSync = {
  playbackTime: 0,
  isPlaying: false,
  videoUrl: "",
  source: "",
  mediaMode: "video_url",
  lastUpdatedAt: 0,
  latestMessage: "",
};

const LOGS_PER_SECOND_LIMIT = 20;
const MAX_LOGS = 200;
const MAX_LATENCY_POINTS = 40;

export const useSyncStore = create((set) => ({
  room: null,
  sync: initialSync,
  telemetry: initialTelemetry,
  logs: [],
  logWindowStart: 0,
  logWindowCount: 0,
  setRoom(room) {
    set((state) => ({
      room,
      sync: {
        ...state.sync,
        playbackTime: room?.playback_time ?? 0,
        isPlaying: Boolean(room?.is_playing),
        videoUrl: room?.video_url || "",
        source: room?.broadcaster || "",
        mediaMode: room?.media_mode || state.sync.mediaMode,
        latestMessage: room?.latest_message || "",
        lastUpdatedAt: Date.now(),
      },
      telemetry: {
        ...state.telemetry,
        usersConnected: room?.listener_count ?? 0,
      },
    }));
  },
  mergeRoom(room) {
    set((state) => ({
      room: { ...(state.room || {}), ...(room || {}) },
      sync: {
        ...state.sync,
        playbackTime: room?.playback_time ?? state.sync.playbackTime,
        isPlaying: typeof room?.is_playing === "boolean" ? room.is_playing : state.sync.isPlaying,
        videoUrl: room?.video_url ?? state.sync.videoUrl,
        mediaMode: room?.media_mode ?? state.sync.mediaMode,
        latestMessage: room?.latest_message ?? state.sync.latestMessage,
        lastUpdatedAt: room ? Date.now() : state.sync.lastUpdatedAt,
      },
      telemetry: {
        ...state.telemetry,
        usersConnected: room?.listener_count ?? state.telemetry.usersConnected,
      },
    }));
  },
  applySocketEvent(event, data) {
    set((state) => {
      const nextLatency = data?.latency_ms ?? state.telemetry.latencyMs;
      const nextHistory = data?.latency_ms == null
        ? state.telemetry.latencyHistory
        : [...state.telemetry.latencyHistory, { ts: Date.now(), value: data.latency_ms }].slice(-MAX_LATENCY_POINTS);

      let nextListeners = state.room?.listeners ?? [];
      const incomingListeners = data?.listeners;
      if (incomingListeners) {
        nextListeners = incomingListeners;
      } else if ((event === "join_room" || event === "listener_ready") && data?.listener_id) {
        if (!nextListeners.find(l => l.listener_id === data.listener_id)) {
          nextListeners = [...nextListeners, {
            listener_id: data.listener_id,
            joined_at: new Date().toISOString(),
            last_ping: new Date().toISOString()
          }];
        }
      }

      const currentRoom = state.room || {};
      const nextRoom = {
        ...currentRoom,
        playback_time: data?.playback_time ?? currentRoom.playback_time,
        is_playing: data?.is_playing ?? currentRoom.is_playing,
        video_url: data?.video_url ?? currentRoom.video_url,
        listener_count: data?.listener_count ?? currentRoom.listener_count,
        listeners: nextListeners,
        latest_message: data?.message ?? data?.latest_message ?? currentRoom.latest_message,
        media_mode: data?.media_mode ?? currentRoom.media_mode,
      };

      return {
        room: nextRoom,
        sync: {
          ...state.sync,
          playbackTime: data?.playback_time ?? state.sync.playbackTime,
          isPlaying: data?.is_playing ?? state.sync.isPlaying,
          videoUrl: data?.video_url ?? state.sync.videoUrl,
          source: data?.source ?? state.sync.source,
          mediaMode: data?.media_mode ?? state.sync.mediaMode,
          latestMessage: data?.message ?? data?.latest_message ?? state.sync.latestMessage,
          lastUpdatedAt: data ? Date.now() : state.sync.lastUpdatedAt,
        },
        telemetry: {
          ...state.telemetry,
          latencyMs: nextLatency,
          syncOffsetMs: data?.sync_offset_ms ?? state.telemetry.syncOffsetMs,
          usersConnected: data?.listener_count ?? state.telemetry.usersConnected,
          videoState: event === "media_status" ? (data?.video_enabled ? "live" : "idle") : (event === "play" ? "playing" : event === "pause" ? "paused" : state.telemetry.videoState),
          audioState: event === "media_status" ? (data?.audio_enabled ? "live" : "idle") : state.telemetry.audioState,
          latencyHistory: nextHistory,
        },
      };
    });
  },
  updateTelemetry(data) {
    set((state) => {
      const latencyHistory = data.latencyMs == null
        ? state.telemetry.latencyHistory
        : [...state.telemetry.latencyHistory, { ts: Date.now(), value: data.latencyMs }].slice(-MAX_LATENCY_POINTS);

      return {
        telemetry: {
          ...state.telemetry,
          ...data,
          latencyHistory,
        },
      };
    });
  },
  pushLog(message) {
    set((state) => {
      const now = Date.now();
      const sameWindow = now - state.logWindowStart < 1000;
      const nextWindowStart = sameWindow ? state.logWindowStart : now;
      const nextWindowCount = sameWindow ? state.logWindowCount : 0;

      if (nextWindowCount >= LOGS_PER_SECOND_LIMIT) {
        return {
          logWindowStart: nextWindowStart,
          logWindowCount: nextWindowCount,
        };
      }

      return {
        logs: [...state.logs, `${new Date().toLocaleTimeString()} ${message}`].slice(-MAX_LOGS),
        logWindowStart: nextWindowStart,
        logWindowCount: nextWindowCount + 1,
      };
    });
  },
}));
