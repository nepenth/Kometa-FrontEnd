import os
import yaml
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .auth import get_current_user, User

router = APIRouter()

class ConfigRequest(BaseModel):
    config_name: str
    config_content: str

class StatusResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class ConfigStructureResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class FileContentResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class FileReference(BaseModel):
    type: str
    reference: str
    path: Optional[str] = None
    asset_directory: Optional[str] = None
    resolved_path: Optional[str] = None
    exists: bool = False
    content: Optional[str] = None

# Helper to locate config files
def get_config_path(config_name: str = "config.yml") -> str:
    # Assuming config is in the 'config' directory relative to the project root
    # Adjust path logic as needed based on where kometa.py is running
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config"))
    return os.path.join(base_dir, config_name)

def resolve_file_reference(reference: str) -> FileReference:
    """Resolve file references to actual paths"""
    if reference.startswith("default:"):
        # Handle default references
        default_name = reference.split(":")[1].strip()
        return resolve_default_file(default_name)
    elif reference.startswith("file:"):
        # Handle local file references
        file_path = reference.split(":", 1)[1].strip()
        return resolve_local_file(file_path)
    elif reference.startswith("repo:"):
        # Handle repository references
        repo_path = reference.split(":", 1)[1].strip()
        return resolve_repo_reference(repo_path)
    else:
        return FileReference(
            type="unknown",
            reference=reference,
            exists=False
        )

def resolve_default_file(default_name: str) -> FileReference:
    """Resolve default file references"""
    # Look in defaults directory
    defaults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "defaults"))

    # Try different extensions and directories
    possible_paths = [
        os.path.join(defaults_dir, f"{default_name}.yml"),
        os.path.join(defaults_dir, f"{default_name}.yaml"),
        os.path.join(defaults_dir, default_name)
    ]

    for path in possible_paths:
        if os.path.exists(path):
            return FileReference(
                type="default",
                reference=f"default:{default_name}",
                path=path,
                resolved_path=path,
                exists=True
            )

    return FileReference(
        type="default",
        reference=f"default:{default_name}",
        exists=False
    )

def resolve_local_file(file_path: str) -> FileReference:
    """Resolve local file references"""
    # Handle relative paths
    if not os.path.isabs(file_path):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        file_path = os.path.join(base_dir, file_path)

    if os.path.exists(file_path):
        return FileReference(
            type="local",
            reference=f"file:{file_path}",
            path=file_path,
            resolved_path=file_path,
            exists=True
        )

    return FileReference(
        type="local",
        reference=f"file:{file_path}",
        exists=False
    )

def resolve_repo_reference(repo_path: str) -> FileReference:
    """Resolve repository references"""
    # Look in defaults directory
    defaults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "defaults"))
    repo_full_path = os.path.join(defaults_dir, repo_path)

    if os.path.exists(repo_full_path):
        if os.path.isdir(repo_full_path):
            # For directories, return the directory path
            return FileReference(
                type="repo",
                reference=f"repo:{repo_path}",
                path=repo_full_path,
                resolved_path=repo_full_path,
                exists=True
            )
        else:
            # For files, return the file path
            return FileReference(
                type="repo",
                reference=f"repo:{repo_path}",
                path=repo_full_path,
                resolved_path=repo_full_path,
                exists=True
            )

    return FileReference(
        type="repo",
        reference=f"repo:{repo_path}",
        exists=False
    )

def get_config_structure() -> Dict[str, Any]:
    """Get hierarchical structure of configuration"""
    config_path = get_config_path()
    if not os.path.exists(config_path):
        raise HTTPException(status_code=404, detail="Configuration file not found")

    with open(config_path, "r", encoding="utf-8") as f:
        config_content = f.read()

    try:
        config = yaml.safe_load(config_content)
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {e}")

    structure = {
        "libraries": {},
        "playlists": config.get("playlist_files", []),
        "settings": {}
    }

    # Extract settings (everything except libraries and playlist_files)
    for key, value in config.items():
        if key not in ["libraries", "playlist_files"]:
            structure["settings"][key] = value

    # Process libraries
    for lib_name, lib_config in config.get("libraries", {}).items():
        lib_structure = {
            "collection_files": [],
            "overlay_files": [],
            "metadata_files": [],
            "settings": {}
        }

        # Process collection files
        for collection_ref in lib_config.get("collection_files", []):
            if isinstance(collection_ref, str):
                # Simple reference
                lib_structure["collection_files"].append({
                    "reference": collection_ref,
                    **resolve_file_reference(collection_ref).dict()
                })
            elif isinstance(collection_ref, dict):
                # Complex reference with asset_directory
                ref_key = next(iter(collection_ref.keys()))
                ref_value = collection_ref[ref_key]
                resolved = resolve_file_reference(f"{ref_key}:{ref_value}")
                lib_structure["collection_files"].append({
                    "reference": f"{ref_key}:{ref_value}",
                    "asset_directory": collection_ref.get("asset_directory"),
                    **resolved.dict()
                })

        # Process overlay files
        for overlay_ref in lib_config.get("overlay_files", []):
            if isinstance(overlay_ref, str):
                lib_structure["overlay_files"].append({
                    "reference": overlay_ref,
                    **resolve_file_reference(overlay_ref).dict()
                })
            elif isinstance(overlay_ref, dict):
                ref_key = next(iter(overlay_ref.keys()))
                ref_value = overlay_ref[ref_key]
                resolved = resolve_file_reference(f"{ref_key}:{ref_value}")
                lib_structure["overlay_files"].append({
                    "reference": f"{ref_key}:{ref_value}",
                    **resolved.dict()
                })

        # Process metadata files
        for metadata_ref in lib_config.get("metadata_files", []):
            if isinstance(metadata_ref, str):
                lib_structure["metadata_files"].append({
                    "reference": metadata_ref,
                    **resolve_file_reference(metadata_ref).dict()
                })

        # Extract library settings
        for key, value in lib_config.items():
            if key not in ["collection_files", "overlay_files", "metadata_files"]:
                lib_structure["settings"][key] = value

        structure["libraries"][lib_name] = lib_structure

    return structure

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

@router.get("/config/structure", response_model=ConfigStructureResponse)
async def get_config_structure_endpoint(current_user: User = Depends(get_current_user)):
    """Get hierarchical structure of configuration"""
    try:
        structure = get_config_structure()
        return {
            "status": "success",
            "message": "Configuration structure retrieved",
            "data": structure
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config/file-content", response_model=FileContentResponse)
async def get_file_content(
    path: str,
    current_user: User = Depends(get_current_user)
):
    """Get content of configuration file"""
    try:
        resolved = resolve_file_reference(path)

        if not resolved.exists or not resolved.resolved_path:
            raise HTTPException(status_code=404, detail=f"File not found: {path}")

        with open(resolved.resolved_path, "r", encoding="utf-8") as f:
            content = f.read()

        return {
            "status": "success",
            "message": "File content retrieved",
            "data": {
                "path": path,
                "resolved_path": resolved.resolved_path,
                "type": resolved.type,
                "content": content
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config/files", response_model=StatusResponse)
async def list_config_files(current_user: User = Depends(get_current_user)):
    """List all configuration files"""
    try:
        config_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config"))
        defaults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "defaults"))

        config_files = []
        defaults_files = []

        # List config directory files
        if os.path.exists(config_dir):
            for root, dirs, files in os.walk(config_dir):
                for file in files:
                    if file.endswith(('.yml', '.yaml')):
                        rel_path = os.path.relpath(os.path.join(root, file), config_dir)
                        config_files.append({
                            "path": f"config/{rel_path}",
                            "type": "local",
                            "full_path": os.path.join(root, file)
                        })

        # List defaults directory files
        if os.path.exists(defaults_dir):
            for root, dirs, files in os.walk(defaults_dir):
                for file in files:
                    if file.endswith(('.yml', '.yaml')):
                        rel_path = os.path.relpath(os.path.join(root, file), defaults_dir)
                        defaults_files.append({
                            "path": f"defaults/{rel_path}",
                            "type": "default",
                            "full_path": os.path.join(root, file)
                        })

        return {
            "status": "success",
            "message": "Configuration files listed",
            "data": {
                "config_files": config_files,
                "defaults_files": defaults_files,
                "total_files": len(config_files) + len(defaults_files)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def validate_yaml_content(yaml_content: str) -> Dict[str, Any]:
    """Validate YAML content syntax and basic structure"""
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "structure": {}
    }

    try:
        # Parse YAML
        config = yaml.safe_load(yaml_content)
        if config is None:
            validation_result["warnings"].append("Empty YAML document")
            return validation_result

        # Basic structure validation
        if not isinstance(config, dict):
            validation_result["errors"].append("Configuration must be a YAML object (dictionary)")
            validation_result["valid"] = False
            return validation_result

        # Check for required sections
        if "libraries" not in config:
            validation_result["warnings"].append("No libraries section found")

        # Validate libraries structure
        if "libraries" in config:
            libraries = config["libraries"]
            if not isinstance(libraries, dict):
                validation_result["errors"].append("Libraries must be an object")
                validation_result["valid"] = False
            else:
                for lib_name, lib_config in libraries.items():
                    if not isinstance(lib_config, dict):
                        validation_result["errors"].append(f"Library '{lib_name}' must be an object")
                        validation_result["valid"] = False
                    else:
                        # Check for valid library settings
                        valid_keys = ["collection_files", "overlay_files", "metadata_files", "remove_overlays",
                                     "metadata_path", "settings", "operations"]
                        for key in lib_config.keys():
                            if key not in valid_keys:
                                validation_result["warnings"].append(f"Unknown key '{key}' in library '{lib_name}'")

        # Validate file references
        if "libraries" in config:
            for lib_name, lib_config in config["libraries"].items():
                if "collection_files" in lib_config:
                    for i, collection_ref in enumerate(lib_config["collection_files"]):
                        if isinstance(collection_ref, str):
                            ref_type = "unknown"
                            if collection_ref.startswith("default:"):
                                ref_type = "default"
                            elif collection_ref.startswith("file:"):
                                ref_type = "file"
                            elif collection_ref.startswith("repo:"):
                                ref_type = "repo"

                            if ref_type == "unknown":
                                validation_result["errors"].append(
                                    f"Invalid collection reference format in library '{lib_name}': {collection_ref}"
                                )
                                validation_result["valid"] = False
                        elif isinstance(collection_ref, dict):
                            # Check for valid reference types
                            ref_key = next(iter(collection_ref.keys()))
                            if ref_key not in ["default", "file", "repo"]:
                                validation_result["errors"].append(
                                    f"Invalid collection reference type '{ref_key}' in library '{lib_name}'"
                                )
                                validation_result["valid"] = False

        validation_result["structure"] = {
            "has_libraries": "libraries" in config,
            "library_count": len(config.get("libraries", {})),
            "has_playlists": "playlist_files" in config,
            "has_settings": any(key for key in config.keys() if key not in ["libraries", "playlist_files"])
        }

    except yaml.YAMLError as e:
        validation_result["errors"].append(f"YAML syntax error: {str(e)}")
        validation_result["valid"] = False
    except Exception as e:
        validation_result["errors"].append(f"Validation error: {str(e)}")
        validation_result["valid"] = False

    return validation_result

def validate_file_reference(reference: str) -> Dict[str, Any]:
    """Validate a single file reference"""
    result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "reference": reference,
        "type": "unknown"
    }

    try:
        if reference.startswith("default:"):
            result["type"] = "default"
            default_name = reference.split(":")[1].strip()
            if not default_name:
                result["errors"].append("Default reference cannot be empty")
                result["valid"] = False
        elif reference.startswith("file:"):
            result["type"] = "file"
            file_path = reference.split(":", 1)[1].strip()
            if not file_path:
                result["errors"].append("File path cannot be empty")
                result["valid"] = False
            elif not os.path.exists(file_path):
                result["warnings"].append(f"File not found: {file_path}")
        elif reference.startswith("repo:"):
            result["type"] = "repo"
            repo_path = reference.split(":", 1)[1].strip()
            if not repo_path:
                result["errors"].append("Repository path cannot be empty")
                result["valid"] = False
        else:
            result["errors"].append("Unknown reference type. Must start with default:, file:, or repo:")
            result["valid"] = False

    except Exception as e:
        result["errors"].append(f"Reference validation error: {str(e)}")
        result["valid"] = False

    return result

class ValidationRequest(BaseModel):
    yaml_content: str

class ValidationResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

@router.post("/config/validate", response_model=ValidationResponse)
async def validate_config(
    validation_request: ValidationRequest,
    current_user: User = Depends(get_current_user)
):
    """Validate YAML configuration content"""
    try:
        validation_result = validate_yaml_content(validation_request.yaml_content)
        return {
            "status": "success" if validation_result["valid"] else "error",
            "message": "Validation completed",
            "data": validation_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config/validate/reference", response_model=ValidationResponse)
async def validate_reference(
    reference: str,
    current_user: User = Depends(get_current_user)
):
    """Validate a single file reference"""
    try:
        validation_result = validate_file_reference(reference)
        return {
            "status": "success" if validation_result["valid"] else "error",
            "message": "Reference validation completed",
            "data": validation_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
