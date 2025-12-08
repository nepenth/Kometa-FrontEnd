import logging
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import List, Optional
import asyncio
from datetime import datetime
from modules.logs import LOG_DIR, MAIN_LOG

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
        # The loop might not be running when the handler is initialized,
        # so we get it dynamically in emit.
        # self.loop = asyncio.get_event_loop() # Removed as per user's implied change

    def emit(self, record):
        try:
            msg = self.format(record)
            # Schedule the broadcast in the event loop
            # The user's provided snippet changes this to ensure_future and gets loop dynamically.
            # Adopting the user's change for emit logic.
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(self.manager.broadcast(msg), loop=loop) # Added loop=loop for clarity
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
