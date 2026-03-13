import React, { useEffect, useRef } from "react";

export function VideoSyncPlayer({ 
  src, 
  stream, 
  sync = {}, 
  isBroadcaster = false, 
  onAction,
  videoElementRef : externalRef 
}) {
  const internalRef = useRef(null);
  const videoRef = externalRef || internalRef;
  const lastSyncRef = useRef(0);

  // Attach WebRTC stream OR MP4 URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch(() => {});
      }
    } else {
      video.srcObject = null;
      if (src && video.src !== src) {
        video.src = src;
      }
    }
  }, [src, stream, videoRef]);

  // Handle Listener Synchronization
  useEffect(() => {
    if (isBroadcaster || !sync || stream) return;
    const video = videoRef.current;
    if (!video) return;

    // Apply Play/Pause
    if (sync.isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!sync.isPlaying && !video.paused) {
      video.pause();
    }

    // Apply Sync Drift Correction
    if (sync.lastUpdatedAt && sync.lastUpdatedAt !== lastSyncRef.current) {
      lastSyncRef.current = sync.lastUpdatedAt;
      
      const assumedPlaybackTime = sync.isPlaying
        ? sync.playbackTime + (Date.now() - sync.lastUpdatedAt) / 1000
        : sync.playbackTime;

      const drift = Math.abs(video.currentTime - assumedPlaybackTime);
      // Wait to correct if drift is larger than 1.5 seconds to avoid micro-stutters
      if (drift > 1.5) {
        video.currentTime = assumedPlaybackTime;
      }
    }
  }, [sync, isBroadcaster, stream, videoRef]);

  return (
    <video
      ref={videoRef}
      controls={isBroadcaster}
      autoPlay
      playsInline
      preload="auto"
      className="w-full h-full object-cover"
      onPlay={() => {
        if (isBroadcaster) onAction?.("play", videoRef.current?.currentTime || 0, true);
      }}
      onPause={() => {
        if (isBroadcaster) onAction?.("pause", videoRef.current?.currentTime || 0, false);
      }}
      onSeeked={() => {
        if (isBroadcaster) onAction?.("sync_state", videoRef.current?.currentTime || 0, !videoRef.current?.paused);
      }}
    />
  );
}
