from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
from datetime import datetime

router = APIRouter()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Mock Log Generator (Background Task)
async def log_generator():
    while True:
        await asyncio.sleep(2)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        levels = ["INFO", "DEBUG", "WARNING", "ERROR"]
        import random
        level = random.choice(levels)
        message = f"[{timestamp}] [{level}] This is a simulated log message from Kometa backend."
        await manager.broadcast(message)

@router.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
