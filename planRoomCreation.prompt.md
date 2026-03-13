Plan: Fix Room Creation & Core Sync Flow

Goal
- Make `/api/create-room` generate a unique `room_code` when not provided, create the Room, and return `{ "room_code": "XXXX" }`.
- Make `/api/join-room` accept an optional client-provided `listener_id`, persist a server-side `listener_id` (UUID), and return `{ "room_code": "XXXX", "listener_id": "uuid" }`.
- Ensure `/api/room-state/<room_code>` returns a serialized Room with `listeners` and `listener_count`.
- Fix frontend/backend mismatches so navigation never goes to `/listener/undefined`.

Phases & Steps

Phase 1 — Minimal backend fixes (core hotfixes)
1.1 Update `backend/synchronizer_app/views.py`:
  - Add `generate_room_code(length=6)` util (uppercase letters + digits).
  - Update `create_room` to: if `room_code` missing, generate one and ensure uniqueness (retry up to N times); require `broadcaster` per user choice and store if model supports it.
  - Respond with `Response({"room_code": room.room_code}, status=201)`.
1.2 Fix `join_room`:
  - Remove duplicate definitions; keep a single POST handler.
  - Accept optional `listener_id` in request. If provided, use it for existing listener lookup (avoid dupes); otherwise create a new `Listener` with server UUID.
  - Return JSON with `room_code` and `listener_id` (string).
1.3 Make `get_room_state` use `RoomSerializer` to include `listeners` and `listener_count`.
1.4 Run migrations only if models changed; otherwise `migrate` to ensure DB is up to date.

Verification for Phase 1
- Start Django dev server and run migrations:
```powershell
cd backend
python -m venv .venv  # optional
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
- Tests:
  - GET `http://127.0.0.1:8000/api/create-room` -> 405 Method Not Allowed
  - POST `http://127.0.0.1:8000/api/create-room` (no body) -> 201 with `{ "room_code": "XXXX" }`
  - POST to `/api/join-room` -> returns `{ room_code, listener_id }`
  - GET `/api/room-state/XXXX` -> includes `listeners` array and `listener_count`.

Phase 2 — WebSocket consumer hardening
2.1 Update `backend/synchronizer_app/consumers.py`:
  - Parse incoming messages with a `type` key and route to handler methods: `load_video`, `sync_state`, `broadcast_message`, `listener_join`, `listener_leave`, `webrtc_offer`, etc.
  - Implement server-side throttling for `sync_state` broadcasts (aggregate per-room or per-sender and broadcast at most once every 2s).
  - On `listener_join`/`listener_leave`, update DB if needed and broadcast updated `listener_count` and `listeners` summary.
2.2 Ensure group messages use a consistent envelope: `{ type: "event", event: "sync_state", payload: { ... } }`.

Verification Phase 2
- Connect 2+ clients to `ws://127.0.0.1:8000/ws/sync/ROOM/` and verify:
  - Events are routed correctly and received by all clients.
  - `sync_state` updates are throttled (no more than 1 update per 2s).
  - `listener_count` updates after join/leave.

Phase 3 — Frontend fixes (API & WebSocket)
3.1 `frontend/src/utils/api.js`:
  - Ensure `API_BASE` uses `import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"` and `createRoom` calls POST `/create-room` without requiring `room_code` client-side.
  - `joinRoom(roomCode, listenerId)` should send `{ room_code, listener_id }` and use server-returned `listener_id` for session reconciliation.
3.2 Fix `CreateRoom.jsx` and `JoinRoom.jsx`:
  - `CreateRoom` should call `api.createRoom({ broadcaster, video_url })` and navigate to `/broadcaster/${room_code}` based on response.
  - `JoinRoom` should call `api.joinRoom(roomCode, localListenerId)`, then use `data.listener_id` (server returned) to store session and navigate to `/listener/${data.room_code}` — do not rely on client-only IDs.
3.3 Fix navigation guards:
  - Prevent navigation when `data.room_code` is missing; show friendly error instead of navigating to `/listener/undefined`.
3.4 `useRealtimeSync` improvements:
  - Implement reconnection/backoff (exponential or capped) and `onopen`, `onclose`, `onerror` handlers.
  - Queue `publish()` messages while socket is not open and flush on open.
  - Expose `wsStatus` and latency measurement hooks.

Verification Phase 3
- From the frontend dev server, create a room, then join as listener; confirm navigation uses server `room_code` and `listener_id` and no `/listener/undefined` occurs.

Phase 4 — WebRTC + Media sync
4.1 `useBroadcastRTC` & `useBroadcastListener`:
  - Ensure signalling messages follow the consumer's envelope and that `listener_id` values match server-state.
  - Broadcaster should create peer connections per active listener by server-known `listener_id` and send offers.
  - Listeners auto-accept offers and attach remote streams to media elements.
4.2 Media sync:
  - Broadcaster publishes `load_video` and periodic `sync_state` (throttled) messages with `{ video_url, playback_time, is_playing }`.
  - Listeners apply `video.currentTime` and `play()`/`pause()` as needed; account for small offsets with drift correction.

Verification Phase 4
- Broadcaster loads MP4 URL → Listeners receive `load_video` and start playback.
- Broadcaster starts voice/video call → Listeners auto-receive streams.

Phase 5 — Polish, performance, and UI fixes
5.1 Throttle terminal logs and implement a log buffer to avoid flooding UI.
5.2 Limit animation rerenders (memoize heavy components, avoid rerender loops in stores).
5.3 Add debug panel (WS status, latency, sync offset, listener count, media state).
5.4 Add robust error handling and friendly UI messages for invalid room codes, backend offline, and WebSocket errors.

Deliverables & Verification
- Code changes in `backend/synchronizer_app/*` and `frontend/src/*` tracked in commits.
- Manual test plan executed and documented.
- Optional: a small test script (curl) for `create-room` and `join-room` responses and a WebSocket smoke test script.

Next immediate action (I will perform now)
- Implement Phase 1 changes: add `generate_room_code`, update `create_room`, fix `join_room` duplicate, and wire `get_room_state` to `RoomSerializer`.

If this plan looks good I will start Phase 1 edits now and run the basic verification checks described above.