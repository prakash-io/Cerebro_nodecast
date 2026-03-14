import { useCallback, useEffect, useRef, useState } from "react";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useBroadcastRTC({ mode, publish, listenerId, onLog, onMediaStatus }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const listenerPeerRef = useRef(null);

  // Store all external callbacks in refs to avoid re-render loops
  const publishRef = useRef(publish);
  const onLogRef = useRef(onLog);
  const onMediaStatusRef = useRef(onMediaStatus);

  useEffect(() => { publishRef.current = publish; });
  useEffect(() => { onLogRef.current = onLog; });
  useEffect(() => { onMediaStatusRef.current = onMediaStatus; });

  const updateMediaStatus = useCallback((stream) => {
    const audioEnabled = Boolean(stream?.getAudioTracks().some((track) => track.enabled));
    const videoEnabled = Boolean(stream?.getVideoTracks().some((track) => track.enabled));
    const liveActive = Boolean(stream && stream.getTracks().length > 0);
    onMediaStatusRef.current?.({ audioEnabled, videoEnabled, liveActive });
  }, []);

  const cleanupPeer = useCallback((peerId) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      peer.close();
      peersRef.current.delete(peerId);
    }
  }, []);

  const toggleVideo = useCallback((enabled) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => { track.enabled = enabled; });
    updateMediaStatus(stream);
  }, [updateMediaStatus]);

  const toggleAudio = useCallback((enabled) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => { track.enabled = enabled; });
    updateMediaStatus(stream);
  }, [updateMediaStatus]);

  const stopLocalBroadcast = useCallback(() => {
    for (const peerId of peersRef.current.keys()) {
      cleanupPeer(peerId);
    }
    if (listenerPeerRef.current) {
      listenerPeerRef.current.close();
      listenerPeerRef.current = null;
    }
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
    }
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    updateMediaStatus(null);
  }, [cleanupPeer, updateMediaStatus]);

  const attachTracks = useCallback((peer) => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    for (const track of stream.getTracks()) {
      peer.addTrack(track, stream);
    }
  }, []);

  const createBroadcasterPeer = useCallback((targetListenerId) => {
    cleanupPeer(targetListenerId);
    const peer = new RTCPeerConnection(RTC_CONFIG);

    attachTracks(peer);
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        publishRef.current("webrtc_ice_candidate", {
          target_listener_id: targetListenerId,
          candidate: event.candidate,
        });
      }
    };
    peer.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
        cleanupPeer(targetListenerId);
      }
    };

    peersRef.current.set(targetListenerId, peer);
    return peer;
  }, [attachTracks, cleanupPeer]);

  const broadcastToListeners = useCallback(async (listenerIds) => {
    if (mode !== "broadcaster" || !localStreamRef.current) {
      return;
    }

    for (const listenerKey of listenerIds) {
      const peer = createBroadcasterPeer(listenerKey);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      publishRef.current("webrtc_offer", {
        target_listener_id: listenerKey,
        sdp: offer,
      });
    }
  }, [createBroadcasterPeer, mode]);

  const startLocalBroadcast = useCallback(async ({ video = false, audio = false }) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
    localStreamRef.current = stream;
    setLocalStream(stream);
    updateMediaStatus(stream);
    onLogRef.current?.(`LIVE ${video ? "VIDEO" : "AUDIO"} READY`);
    return stream;
  }, [updateMediaStatus]);

  const handleSocketEvent = useCallback(async (payload) => {
    const event = payload?.type || payload?.event;
    const data = payload?.data || payload;

    if (mode === "broadcaster") {
      if ((event === "join_room" || event === "listener_ready") && data.listener_id && localStreamRef.current) {
        const peer = createBroadcasterPeer(data.listener_id);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        publishRef.current("webrtc_offer", {
          target_listener_id: data.listener_id,
          sdp: offer,
        });
      }

      if (event === "webrtc_answer" && data.listener_id && data.sdp) {
        const peer = peersRef.current.get(data.listener_id);
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      }

      if (event === "webrtc_ice_candidate" && data.listener_id && data.candidate) {
        const peer = peersRef.current.get(data.listener_id);
        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
      return;
    }

    if (event === "webrtc_offer" && data.target_listener_id === listenerId && data.sdp) {
      if (listenerPeerRef.current) {
        listenerPeerRef.current.close();
      }

      const peer = new RTCPeerConnection(RTC_CONFIG);
      peer.ontrack = (trackEvent) => {
        if (trackEvent.streams && trackEvent.streams[0]) {
          setRemoteStream(trackEvent.streams[0]);
        } else {
          // fallback if streams array is empty
          const fallbackStream = new MediaStream([trackEvent.track]);
          setRemoteStream(fallbackStream);
        }
      };
      peer.onicecandidate = (iceEvent) => {
        if (iceEvent.candidate) {
          publishRef.current("webrtc_ice_candidate", {
            listener_id: listenerId,
            candidate: iceEvent.candidate,
          });
        }
      };
      listenerPeerRef.current = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      publishRef.current("webrtc_answer", {
        listener_id: listenerId,
        sdp: answer,
      });
      return;
    }

    if (event === "webrtc_ice_candidate" && data.target_listener_id === listenerId && data.candidate && listenerPeerRef.current) {
      await listenerPeerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }, [createBroadcasterPeer, listenerId, mode]);

  useEffect(() => () => stopLocalBroadcast(), [stopLocalBroadcast]);

  return {
    localStream,
    remoteStream,
    startLocalBroadcast,
    stopLocalBroadcast,
    toggleVideo,
    toggleAudio,
    handleSocketEvent,
    broadcastToListeners,
  };
}
