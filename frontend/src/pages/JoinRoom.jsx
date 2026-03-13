import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AccessPanel } from "../components/AccessPanel";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import TerminalConsole from "../components/ui/TerminalConsole";
import useStore from "../store/useStore";
import { getListenerSessionId } from "../utils/listenerSession";
import { api } from "../utils/api";

export default function JoinRoom() {
  const navigate = useNavigate();
  const setRoomCodeStore = useStore((state) => state.setRoomCode);
  const setIsBroadcaster = useStore((state) => state.setIsBroadcaster);
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const executeJoin = async (targetCode) => {
    const listenerId = getListenerSessionId();
    const data = await api.joinRoom(targetCode, listenerId);
    setRoomCodeStore(data.room_code);
    setIsBroadcaster(false);
    navigate(`/listener/${data.room_code}`);
  };

  const handleJoinRoom = async (event) => {
    event?.preventDefault();
    const nextCode = roomCode.trim().toUpperCase();
    if (!nextCode) {
      setError("Room code is required.");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      await executeJoin(nextCode);
    } catch (err) {
      setError(err.message || "Unable to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AccessPanel
      eyebrow="LISTENER ACCESS"
      title="JOIN ACTIVE ROOM"
      description="Enter the room code from the broadcaster. Listeners can only consume synced video, live calls, voice, and broadcast messages."
      tone="green"
      aside={
        <TerminalConsole
          initialOutput={[
            "Listener node ready.",
            "Awaiting room code.",
            "Use the broadcaster-issued room code only.",
          ]}
          onCommand={(command) => {
            if (!command.startsWith("connect ")) {
              return "USE: CONNECT ROOMCODE";
            }

            const nextCode = command.split(" ")[1]?.trim().toUpperCase();
            if (!nextCode) {
              return "ROOM CODE REQUIRED";
            }

            setRoomCode(nextCode);
            executeJoin(nextCode).catch((err) => {
              setError(err.message || "Unable to join room.");
            });
            return `JOINING ${nextCode}`;
          }}
        />
      }
    >
      <form onSubmit={handleJoinRoom} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-press-start text-[#00ff66]">ROOM CODE</label>
          <Input
            placeholder="ENTER ROOM CODE"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            neon="green"
            maxLength={12}
          />
        </div>

        {error ? (
          <div className="rounded-md border border-[#ff0033]/30 bg-[#ff0033]/10 px-4 py-3 font-vt323 text-xl text-[#ff8a9d]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button type="submit" variant="secondary" size="lg" disabled={isJoining} magnetic={false}>
            {isJoining ? "JOINING ROOM..." : "JOIN ROOM"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate("/")} magnetic={false}>
            CANCEL
          </Button>
        </div>
      </form>
    </AccessPanel>
  );
}
