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

@router.get("/config", response_model=StatusResponse)
async def get_config(current_user: User = Depends(get_current_user)):
    # Mock configuration retrieval
    mock_config = """
libraries:
  Movies:
    metadata_path:
      - file: config/Movies.yml
    settings:
      missing_only_released: true
  TV Shows:
    metadata_path:
      - file: config/TVShows.yml
settings:
  cache: true
  cache_expiration: 60
  asset_directory: config/assets
"""
    return {
        "status": "success",
        "message": "Configuration retrieved",
        "data": {
            "config_files": ["config.yml", "Movies.yml", "TVShows.yml"],
            "current_config": mock_config
        }
    }

@router.post("/config", response_model=StatusResponse)
async def save_config(config_request: ConfigRequest, current_user: User = Depends(get_current_user)):
    try:
        # This will be replaced with actual config saving logic
        return {
            "status": "success",
            "message": "Configuration saved",
            "data": {
                "config_name": config_request.config_name,
                "saved": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config/schema", response_model=Dict[str, Any])
async def get_config_schema(current_user: User = Depends(get_current_user)):
    # Mock schema for Monaco Editor intellisense
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
