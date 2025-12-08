from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from ruamel.yaml import YAML
from .auth import get_current_user, User
from .config import get_config_path
from modules import runner

router = APIRouter()
yaml = YAML()
yaml.preserve_quotes = True

class Library(BaseModel):
    name: str
    config: Dict[str, Any]

class LibraryRunRequest(BaseModel):
    ignore_schedules: bool = False

class StatusResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

@router.get("/libraries", response_model=StatusResponse)
async def get_libraries(current_user: User = Depends(get_current_user)):
    try:
        config_path = get_config_path()
        if not os.path.exists(config_path):
             return {
                "status": "error",
                "message": "Configuration file not found",
                "data": {"libraries": []}
            }
        
        with open(config_path, "r", encoding="utf-8") as f:
            config_data = yaml.load(f)

        libraries = []
        if config_data and "libraries" in config_data:
            for name, details in config_data["libraries"].items():
                libraries.append({
                    "name": name,
                    "config": details or {}
                })

        return {
            "status": "success",
            "message": "Libraries retrieved",
            "data": {
                "libraries": libraries
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/libraries/{library_name}", response_model=StatusResponse)
async def get_library(library_name: str, current_user: User = Depends(get_current_user)):
    try:
        config_path = get_config_path()
        if not os.path.exists(config_path):
             raise HTTPException(status_code=404, detail="Configuration file not found")
        
        with open(config_path, "r", encoding="utf-8") as f:
            config_data = yaml.load(f)

        if not config_data or "libraries" not in config_data or library_name not in config_data["libraries"]:
            raise HTTPException(status_code=404, detail=f"Library '{library_name}' not found")

        return {
            "status": "success",
            "message": "Library details retrieved",
            "data": {
                "name": library_name,
                "config": config_data["libraries"][library_name] or {}
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/libraries/{library_name}/run", response_model=StatusResponse)
async def run_library(
    library_name: str, 
    run_request: LibraryRunRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify library exists
        config_path = get_config_path()
        with open(config_path, "r", encoding="utf-8") as f:
            config_data = yaml.load(f)
        
        if not config_data or "libraries" not in config_data or library_name not in config_data["libraries"]:
            raise HTTPException(status_code=404, detail=f"Library '{library_name}' not found")

        # Trigger run
        run_args = {
            "libraries": library_name,
            "ignore_schedules": run_request.ignore_schedules
        }
        
        # We use threading/background task to run this so it doesn't block
        # modules.runner.process uses ProcessPoolExecutor, so it should be non-blocking mostly,
        # but we wrap it in a background task to return immediately.
        background_tasks.add_task(runner.process, run_args)

        return {
            "status": "success",
            "message": f"Run triggered for library '{library_name}'",
            "data": {
                "library": library_name,
                "status": "queued"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
