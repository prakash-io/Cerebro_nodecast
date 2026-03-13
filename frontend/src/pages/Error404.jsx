import { useNavigate } from "react-router-dom";

import { AccessPanel } from "../components/AccessPanel";
import { Button } from "../components/ui/Button";

export default function Error404() {
  const navigate = useNavigate();

  return (
    <AccessPanel
      eyebrow="HAWKINS LAB NAVIGATION ERROR"
      title="404 // SIGNAL LOST"
      description="The requested transmission path does not exist. The route is either invalid or the room code is missing."
      aside={
        <div className="flex h-full flex-col justify-between">
          <div className="font-press-start text-lg text-white">RECOVERY OPTIONS</div>
          <div className="space-y-3 font-vt323 text-2xl text-white/65">
            <div>1. Return to the control console</div>
            <div>2. Create a fresh room</div>
            <div>3. Join with a valid room code</div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/50 p-4 font-vt323 text-xl text-white/50">
            BROADCASTER PATHS REQUIRE A ROOM CODE AFTER CREATION.
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button variant="primary" size="lg" onClick={() => navigate("/")}>
          RETURN HOME
        </Button>
        <Button variant="ghost" size="lg" onClick={() => navigate("/create-room")}>
          CREATE ROOM
        </Button>
        <Button variant="ghost" size="lg" onClick={() => navigate("/join-room")}>
          JOIN ROOM
        </Button>
      </div>
    </AccessPanel>
  );
}
