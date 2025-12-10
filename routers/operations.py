import os
import uuid
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .auth import get_current_user, User
import subprocess
import threading
import json
import time

router = APIRouter()

class OperationRequest(BaseModel):
    libraries: Optional[List[str]] = None
    collections: Optional[List[str]] = None
    dry_run: bool = False

class OperationResponse(BaseModel):
    operation_id: str
    status: str
    message: str

class OperationStatusResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

# Operation store (in production, use a database)
operations = {}

class OperationStatus:
    def __init__(self, operation_id: str):
        self.operation_id = operation_id
        self.status = "queued"
        self.start_time = None
        self.end_time = None
        self.progress = 0
        self.logs = []
        self.errors = []
        self.result = None
        self.websocket_connections = set()

    def add_log(self, message: str):
        timestamp = datetime.now().isoformat()
        self.logs.append(f"[{timestamp}] {message}")
        if len(self.logs) > 1000:  # Limit log size
            self.logs = self.logs[-1000:]

    def add_error(self, error: str):
        timestamp = datetime.now().isoformat()
        error_msg = f"[{timestamp}] ERROR: {error}"
        self.errors.append(error_msg)
        self.add_log(error_msg)

    def update_progress(self, progress: int):
        self.progress = min(max(progress, 0), 100)

    def update_status(self, status: str):
        self.status = status
        if status == "running" and not self.start_time:
            self.start_time = datetime.now().isoformat()
        elif status in ["completed", "failed", "cancelled"] and not self.end_time:
            self.end_time = datetime.now().isoformat()

    def add_websocket(self, websocket: WebSocket):
        self.websocket_connections.add(websocket)

    def remove_websocket(self, websocket: WebSocket):
        self.websocket_connections.discard(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for websocket in self.websocket_connections:
            try:
                await websocket.send_json(message)
            except Exception:
                self.websocket_connections.discard(websocket)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "operation_id": self.operation_id,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "progress": self.progress,
            "log_count": len(self.logs),
            "error_count": len(self.errors),
            "result": self.result
        }

def run_kometa_operation(operation_id: str, libraries: Optional[List[str]] = None, collections: Optional[List[str]] = None, dry_run: bool = False):
    """Run Kometa operation in a background thread"""
    operation = operations.get(operation_id)
    if not operation:
        return

    try:
        operation.update_status("running")
        operation.update_progress(0)
        operation.add_log("Starting Kometa operation...")

        # Build command
        command = ["python", "kometa.py", "--run"]
        if dry_run:
            command.append("--tests")

        if libraries:
            command.extend(["--run-libraries", "|".join(libraries)])
        if collections:
            command.extend(["--run-collections", "|".join(collections)])

        operation.add_log(f"Command: {' '.join(command)}")

        # Run process
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )

        # Read output in real-time
        while True:
            if process.poll() is not None:
                break

            # Read stdout
            line = process.stdout.readline()
            if line:
                operation.add_log(line.strip())

            # Read stderr
            error_line = process.stderr.readline()
            if error_line:
                operation.add_error(error_line.strip())

            # Update progress (simplified - in real implementation, parse output)
            if process.poll() is None:
                operation.update_progress(min(operation.progress + 5, 95))

        # Get final output
        stdout, stderr = process.communicate()

        if stdout:
            for line in stdout.split('\n'):
                if line.strip():
                    operation.add_log(line.strip())

        if stderr:
            for line in stderr.split('\n'):
                if line.strip():
                    operation.add_error(line.strip())

        # Determine final status
        if process.returncode == 0:
            operation.update_status("completed")
            operation.update_progress(100)
            operation.result = {"success": True, "return_code": process.returncode}
            operation.add_log("Operation completed successfully")
        else:
            operation.update_status("failed")
            operation.result = {"success": False, "return_code": process.returncode}
            operation.add_log(f"Operation failed with return code {process.returncode}")

    except Exception as e:
        operation.update_status("failed")
        operation.add_error(f"Unexpected error: {str(e)}")
        operation.result = {"success": False, "error": str(e)}
    finally:
        # Clean up
        if operation.operation_id in operations:
            del operations[operation.operation_id]

@router.post("/operations", response_model=OperationResponse)
async def start_operation(
    operation_request: OperationRequest,
    current_user: User = Depends(get_current_user)
):
    """Start a new Kometa operation"""
    try:
        operation_id = str(uuid.uuid4())
        operation = OperationStatus(operation_id)
        operations[operation_id] = operation

        # Start operation in background thread
        thread = threading.Thread(
            target=run_kometa_operation,
            args=(operation_id, operation_request.libraries, operation_request.collections, operation_request.dry_run),
            daemon=True
        )
        thread.start()

        return {
            "operation_id": operation_id,
            "status": "started",
            "message": "Operation started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operations/{operation_id}", response_model=OperationStatusResponse)
async def get_operation_status(
    operation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get status of an operation"""
    try:
        operation = operations.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        return {
            "status": "success",
            "message": "Operation status retrieved",
            "data": operation.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operations/{operation_id}/logs", response_model=OperationStatusResponse)
async def get_operation_logs(
    operation_id: str,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get logs for an operation"""
    try:
        operation = operations.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        logs = operation.logs[-limit:] if limit else operation.logs

        return {
            "status": "success",
            "message": "Operation logs retrieved",
            "data": {
                **operation.to_dict(),
                "logs": logs,
                "errors": operation.errors
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/operations/{operation_id}/cancel", response_model=OperationStatusResponse)
async def cancel_operation(
    operation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel an operation"""
    try:
        operation = operations.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        if operation.status not in ["queued", "running"]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel operation in {operation.status} state")

        operation.update_status("cancelled")
        operation.add_log("Operation cancelled by user")

        return {
            "status": "success",
            "message": "Operation cancellation requested",
            "data": operation.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operations", response_model=OperationStatusResponse)
async def list_operations(current_user: User = Depends(get_current_user)):
    """List all operations"""
    try:
        operation_list = [
            {
                "operation_id": op_id,
                **operations[op_id].to_dict()
            }
            for op_id in operations.keys()
        ]

        return {
            "status": "success",
            "message": "Operations listed",
            "data": {
                "operations": operation_list,
                "count": len(operation_list)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/operations/{operation_id}/ws")
async def operation_websocket(
    websocket: WebSocket,
    operation_id: str,
    current_user: User = Depends(get_current_user)
):
    """WebSocket endpoint for real-time operation updates"""
    await websocket.accept()

    try:
        operation = operations.get(operation_id)
        if not operation:
            await websocket.send_json({
                "type": "error",
                "message": "Operation not found"
            })
            await websocket.close()
            return

        # Add websocket to operation
        operation.add_websocket(websocket)

        # Send current status
        await websocket.send_json({
            "type": "status",
            "data": operation.to_dict()
        })

        # Keep connection open until client disconnects
        while True:
            try:
                # Just wait for disconnect
                await websocket.receive_text()
            except WebSocketDisconnect:
                break

    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        if operation_id in operations:
            operations[operation_id].remove_websocket(websocket)
        await websocket.close()