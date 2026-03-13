import urllib.request
import json

BASE = 'http://127.0.0.1:8000'

headers = {'Content-Type': 'application/json'}

# Create room
create_payload = json.dumps({'broadcaster': 'TestUser', 'video_url': ''}).encode('utf-8')
req = urllib.request.Request(BASE + '/api/create-room', data=create_payload, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('CREATE_STATUS', resp.status)
        print(body)
        data = json.loads(body)
        room_code = data.get('room_code')
except Exception as e:
    print('CREATE_ERROR', e)
    raise

# Join room
join_payload = json.dumps({'room_code': room_code}).encode('utf-8')
req = urllib.request.Request(BASE + '/api/join-room', data=join_payload, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('JOIN_STATUS', resp.status)
        print(body)
        data = json.loads(body)
        listener_id = data.get('listener_id')
except Exception as e:
    print('JOIN_ERROR', e)
    raise

# Get room state
req = urllib.request.Request(BASE + f'/api/room-state/{room_code}', headers=headers, method='GET')
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('STATE_STATUS', resp.status)
        print(body)
except Exception as e:
    print('STATE_ERROR', e)
    raise
