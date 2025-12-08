import os
import yaml
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from .auth import get_current_user, User

router = APIRouter()

class ConfigRequest(BaseModel):
    config_name: str
    config_content: str

class StatusResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

# Helper to locate config files
def get_config_path(config_name: str = "config.yml") -> str:
    # Assuming config is in the 'config' directory relative to the project root
    # Adjust path logic as needed based on where kometa.py is running
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config"))
    return os.path.join(base_dir, config_name)

@router.get("/config", response_model=StatusResponse)
async def get_config(current_user: User = Depends(get_current_user)):
    try:
        config_path = get_config_path()
        if not os.path.exists(config_path):
             return {
                "status": "error",
                "message": "Configuration file not found",
                "data": {
                    "config_files": [],
                    "current_config": ""
                }
            }
        
        with open(config_path, "r", encoding="utf-8") as f:
            config_content = f.read()

        # List other yml files in config dir
        config_dir = os.path.dirname(config_path)
        config_files = [f for f in os.listdir(config_dir) if f.endswith(".yml") or f.endswith(".yaml")]

        return {
            "status": "success",
            "message": "Configuration retrieved",
            "data": {
                "config_files": config_files,
                "current_config": config_content
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/config", response_model=StatusResponse)
async def save_config(config_request: ConfigRequest, current_user: User = Depends(get_current_user)):
    try:
        config_path = get_config_path(config_request.config_name)
        
        # Validate YAML before saving
        try:
            yaml.safe_load(config_request.config_content)
        except yaml.YAMLError as e:
             raise HTTPException(status_code=400, detail=f"Invalid YAML: {e}")

        with open(config_path, "w", encoding="utf-8") as f:
            f.write(config_request.config_content)

        return {
            "status": "success",
            "message": "Configuration saved",
            "data": {
                "config_name": config_request.config_name,
                "saved": True
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config/schema", response_model=Dict[str, Any])
async def get_config_schema(current_user: User = Depends(get_current_user)):
    # Mock schema for Monaco Editor intellisense - keeping this as mock for now as schema generation is complex
    # Ideally we would generate this from the ConfigFile class or a schema file
    return {
        "status": "success",
        "message": "Schema retrieved",
        "data": {
            "libraries": {
                "type": "object",
                "description": "Library definitions",
                "additionalProperties": {
                    "type": "object",
                    "properties": {
                        "metadata_path": {"type": "string"},
                        "settings": {"type": "object"}
                    }
                }
            },
            "playlist_files": {
                "type": "array",
                "items": {"type": "string"}
            },
            "settings": {
                "type": "object",
                "properties": {
                    "cache": {"type": "boolean"},
                    "cache_expiration": {"type": "integer"},
                    "asset_directory": {"type": "string"}
                }
            }
        }
    }
