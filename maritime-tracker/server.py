#!/usr/bin/env python3
"""
Maritime Team Tracker - Servidor local
Instalar: pip install flask
Ejecutar: python server.py
"""

from flask import Flask, jsonify, request, send_from_directory
import json, os
from datetime import datetime

app = Flask(__name__, static_folder='static')
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'state.json')

DEFAULT_STATE = {
    "users": [
        {"id": "u1", "name": "Usuario 1", "emoji": "⚓", "color": "#00b4d8", "location_id": "oficina", "since": ""},
        {"id": "u2", "name": "Usuario 2", "emoji": "🚢", "color": "#f4a261", "location_id": "oficina", "since": ""},
        {"id": "u3", "name": "Usuario 3", "emoji": "🧭", "color": "#2dc653", "location_id": "oficina", "since": ""},
    ],
    "locations": [
        {"id": "oficina",  "name": "Oficina",   "type": "office", "x": 50, "y": 55},
        {"id": "puerto",   "name": "Puerto",    "type": "port",   "x": 48, "y": 75},
        {"id": "almacen",  "name": "Almacen",   "type": "other",  "x": 72, "y": 65},
        {"id": "barco_1",  "name": "Barco 1",   "type": "boat",   "x": 18, "y": 28},
        {"id": "barco_2",  "name": "Barco 2",   "type": "boat",   "x": 40, "y": 15},
        {"id": "barco_3",  "name": "Barco 3",   "type": "boat",   "x": 68, "y": 22},
    ]
}

def load_state():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    state = json.loads(json.dumps(DEFAULT_STATE))
    now = datetime.now().isoformat()
    for u in state['users']:
        u['since'] = now
    save_state(state)
    return state

def save_state(state):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/state')
def get_state():
    return jsonify(load_state())

@app.route('/api/move', methods=['POST'])
def move_user():
    body = request.json
    state = load_state()
    for user in state['users']:
        if user['id'] == body.get('user_id'):
            user['location_id'] = body.get('location_id')
            user['since'] = datetime.now().isoformat()
            break
    save_state(state)
    return jsonify({"ok": True})

@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    body = request.json
    state = load_state()
    for user in state['users']:
        if user['id'] == user_id:
            for field in ('name', 'emoji', 'color'):
                if field in body:
                    user[field] = body[field]
            break
    save_state(state)
    return jsonify({"ok": True})

@app.route('/api/locations', methods=['POST'])
def add_location():
    body = request.json
    state = load_state()
    loc = {
        "id": f"loc_{int(datetime.now().timestamp())}",
        "name": body['name'],
        "type": body.get('type', 'other'),
        "x": body.get('x', 50),
        "y": body.get('y', 50),
    }
    state['locations'].append(loc)
    save_state(state)
    return jsonify(loc)

@app.route('/api/locations/<loc_id>', methods=['PUT'])
def update_location_pos(loc_id):
    body = request.json
    state = load_state()
    for loc in state['locations']:
        if loc['id'] == loc_id:
            if 'x' in body: loc['x'] = body['x']
            if 'y' in body: loc['y'] = body['y']
            if 'name' in body: loc['name'] = body['name']
            break
    save_state(state)
    return jsonify({"ok": True})

@app.route('/api/locations/<loc_id>', methods=['DELETE'])
def delete_location(loc_id):
    state = load_state()
    state['locations'] = [l for l in state['locations'] if l['id'] != loc_id]
    for user in state['users']:
        if user['location_id'] == loc_id:
            user['location_id'] = 'oficina'
            user['since'] = datetime.now().isoformat()
    save_state(state)
    return jsonify({"ok": True})

if __name__ == '__main__':
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "tu-ip-local"

    print("\n" + "="*50)
    print("   Maritime Team Tracker")
    print("="*50)
    print(f"   Este PC   -> http://localhost:5000")
    print(f"   Otros PCs -> http://{local_ip}:5000")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
