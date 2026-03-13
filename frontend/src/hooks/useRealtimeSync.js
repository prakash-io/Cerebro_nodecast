import { useEffect, useRef } from "react";

export function useRealtimeSync(roomCode, onEvent) {

  const socketRef = useRef(null);

  useEffect(() => {

    if (!roomCode) return;

    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/sync/${roomCode}/`
    );

    socketRef.current.onmessage = (event) => {

      const data = JSON.parse(event.data);

      onEvent?.(data);

    };

    return () => socketRef.current?.close();

  }, [roomCode]);

  const publish = (type, payload = {}) => {

    socketRef.current?.send(
      JSON.stringify({
        type,
        ...payload
      })
    );

  };

  return { publish };
}
