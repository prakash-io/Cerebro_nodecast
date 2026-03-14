# Cerebro_Nodecast

Realtime synchronized video broadcasting with a Django + Channels backend and a React + Vite Hawkins Lab interface.

## Stack

- Backend: Django, Django REST Framework, Channels, channels-redis, django-cors-headers
- Frontend: React, Vite, React Router, Zustand, GSAP, Framer Motion, Tailwind CSS, video.js, react-tsparticles, three.js

## Local setup

### Backend

```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`. Backend runs on `http://127.0.0.1:8000`.

## API and websocket contract

- `POST /api/create-room`
- `POST /api/join-room`
- `GET /api/room-state/<ROOM-XXXX>`
- `POST /api/room-state/<ROOM-XXXX>/update`
- `ws://127.0.0.1:8000/ws/sync/<ROOM-XXXX>/`

Websocket events supported:

- `load_video`
- `play`
- `pause`
- `seek`
- `sync_state`
- `join_room`
- `leave_room`
- `broadcast_message`
- `media_status`
- `listener_ready`
- `webrtc_offer`
- `webrtc_answer`
- `webrtc_ice_candidate`

## Verification

Backend tests:

```powershell
cd backend
.\venv\Scripts\python.exe manage.py test
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Multi-user test flow

1. Start backend and frontend.
2. Open `/create-room`, create a room, and copy the `ROOM-XXXX` code.
3. Open `/broadcaster/ROOM-XXXX` in one browser.
4. Open `/listener/ROOM-XXXX` in another browser or device.
5. Play, pause, and seek in the broadcaster panel.
6. Confirm the listener player follows and the debug metrics update.

## Scaling notes

- Synchronized MP4 playback, listener count, chat ticker, and diagnostics can support larger rooms when Django Channels runs on Redis.
- For rooms approaching `100` listeners, set `REDIS_URL` and run Daphne/ASGI behind a real reverse proxy. Do not rely on the in-memory channel layer outside local development.
- The backend now avoids sending the full listener roster to every listener socket. Only broadcaster/debug clients receive the detailed listener list.
- One-browser WebRTC mesh broadcasting is not a realistic architecture for `100` live video or voice listeners. For that case, use an SFU such as LiveKit, mediasoup, Janus, or similar.

## Deployment

### Backend

- Render or Railway for Django + Daphne.
- Upstash Redis for `REDIS_URL`.
- Set `DJANGO_DEBUG=false`, real hostnames, trusted origins, and Redis URL.
- Recommended env for larger rooms:

```powershell
REDIS_URL=redis://...
CHANNEL_LAYER_CAPACITY=1500
CHANNEL_LAYER_EXPIRY=10
CHANNEL_GROUP_EXPIRY=86400
```
- Start command:

```powershell
daphne -b 0.0.0.0 -p $PORT config.asgi:application
```

### Frontend

- Deploy `frontend` to Vercel.
- Set `VITE_API_BASE_URL` to the backend HTTPS URL.
- Set `VITE_WS_BASE_URL` to the backend WSS URL.

## Notes

- The current player uses a direct MP4/video URL for deterministic sync testing.
- Redis is optional locally because the app falls back to the in-memory channel layer when `REDIS_URL` is unset.
- WebRTC mesh sync is not implemented in this baseline.
