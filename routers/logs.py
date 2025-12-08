import logging
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

# Custom Logging Handler
class WebSocketHandler(logging.Handler):
    def __init__(self, manager):
        super().__init__()
        self.manager = manager
        self.loop = asyncio.get_event_loop()

    def emit(self, record):
        try:
            msg = self.format(record)
            # Schedule the broadcast in the event loop
            if self.loop.is_running():
                asyncio.run_coroutine_threadsafe(self.manager.broadcast(msg), self.loop)
        except Exception:
            self.handleError(record)

# Initialize and attach handler
# This should be called when the app starts, or we can attach it here if the logger is available globally.
# However, the logger is in modules.logs.MyLogger.
# We need to attach this handler to the root logger or the specific Kometa logger.

def setup_log_handler():
    # Get the root logger or specific logger
    logger = logging.getLogger("Kometa")
    ws_handler = WebSocketHandler(manager)
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    ws_handler.setFormatter(formatter)
    logger.addHandler(ws_handler)

@router.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
