import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AccessPanel } from "../components/AccessPanel";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import TerminalConsole from "../components/ui/TerminalConsole";
import useStore from "../store/useStore";
import { api } from "../utils/api";

export default function CreateRoom() {
  const navigate = useNavigate();
  const setRoomCodeStore = useStore((state) => state.setRoomCode);
  const setIsBroadcaster = useStore((state) => state.setIsBroadcaster);
  const [roomCode, setRoomCode] = useState("");
  const [broadcasterName, setBroadcasterName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const roomCodeIsValid = /^[A-Z0-9]{4,10}$/.test(normalizedRoomCode);

  const handleCreateRoom = async (event) => {
    event?.preventDefault();
    if (!broadcasterName.trim()) {
      setError("Broadcaster name is required.");
      return;
    }
    if (!roomCodeIsValid) {
      setError("Room code must be 4-10 uppercase letters or digits.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const data = await api.createRoom({
        room_code: normalizedRoomCode,
        broadcaster: broadcasterName.trim(),
        video_url: videoUrl.trim() || "",
      });

      if (!data?.room_code) {
        throw new Error("Room code missing from server response.");
      }

      setRoomCodeStore(data.room_code);
      setIsBroadcaster(true);
      navigate(`/broadcaster/${data.room_code}`);
    } catch (err) {
      setError(err.message || "Unable to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AccessPanel
      eyebrow="BROADCASTER ACCESS"
      title="INITIATE BROADCAST ROOM"
      description="Create the room first. After creation, the broadcaster room unlocks video sync, live video, voice broadcast, and message controls."
      tone="red"
      aside={
        <TerminalConsole
          initialOutput={[
            "Secure link ready.",
            "Valid broadcaster room code is required before creation.",
            "If creation fails, the exact backend error will appear below.",
          ]}
          inputEnabled={false}
        />
      }
    >
      <form onSubmit={handleCreateRoom} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-press-start text-[#00ff66]">ROOM CODE</label>
          <Input
            placeholder="4-10 LETTERS OR DIGITS"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            neon="green"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-press-start text-[#ff0033]">BROADCASTER NAME</label>
          <Input
            placeholder="Required broadcaster name"
            value={broadcasterName}
            onChange={(event) => setBroadcasterName(event.target.value)}
            neon="red"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-press-start text-[#ff0033]">INITIAL VIDEO URL</label>
          <Input
            type="url"
            placeholder="Optional MP4 URL"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            neon="red"
          />
        </div>

        <div className="rounded-md border border-[#00ff66]/20 bg-black/45 px-4 py-3 font-vt323 text-xl text-white/60">
          ROOM CODE STATUS: <span className={roomCodeIsValid ? "text-[#00ff66]" : "text-white/40"}>{roomCodeIsValid ? "VALID FORMAT" : "ENTER 4-10 UPPERCASE LETTERS OR DIGITS"}</span>
        </div>

        {error ? (
          <div className="rounded-md border border-[#ff0033]/30 bg-[#ff0033]/10 px-4 py-3 font-vt323 text-xl text-[#ff8a9d]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button type="submit" variant="primary" size="lg" disabled={isCreating} magnetic={false}>
            {isCreating ? "CREATING ROOM..." : "CREATE ROOM"}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/")} magnetic={false}>
            CANCEL
          </Button>
        </div>
      </form>
    </AccessPanel>
  );
}
