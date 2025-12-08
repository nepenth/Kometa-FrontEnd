import schedule
import time
import threading
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from .auth import get_current_user, User
from modules import runner
from modules.scheduler_manager import scheduler_manager

router = APIRouter()

class JobModel(BaseModel):
    name: str
    type: str = "interval" # interval, daily
    value: str # "10", "10:30"
    unit: str = "minutes" # minutes, hours, days
    target: str = "run_operations"

@router.get("/scheduler/jobs", response_model=Dict[str, Any])
async def get_scheduler_jobs(current_user: User = Depends(get_current_user)):
    try:
        jobs = scheduler_manager.get_jobs()
        return {
            "status": "success",
            "message": "Jobs retrieved",
            "data": jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scheduler/jobs", response_model=Dict[str, Any])
async def create_job(job: JobModel, current_user: User = Depends(get_current_user)):
    try:
        new_job = scheduler_manager.add_job(job.dict())
        return {
            "status": "success",
            "message": "Job created",
            "data": new_job
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/scheduler/jobs/{job_id}", response_model=Dict[str, Any])
async def update_job(job_id: str, job: JobModel, current_user: User = Depends(get_current_user)):
    try:
        updated_job = scheduler_manager.update_job(job_id, job.dict())
        if not updated_job:
            raise HTTPException(status_code=404, detail="Job not found")
        return {
            "status": "success",
            "message": "Job updated",
            "data": updated_job
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/scheduler/jobs/{job_id}", response_model=Dict[str, Any])
async def delete_job(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        scheduler_manager.delete_job(job_id)
        return {
            "status": "success",
            "message": "Job deleted",
            "data": {"job_id": job_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scheduler/trigger/{job_id}", response_model=Dict[str, Any])
async def trigger_job(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Trigger logic remains similar but we can lookup target from config if needed
        # For now, we'll assume job_id might be a specific run type OR a scheduled job ID
        
        run_args = {}
        target = job_id
        
        # Check if it's a scheduled job to get its target
        jobs = scheduler_manager.get_jobs()
        for job in jobs:
            if job.get("id") == job_id:
                target = job.get("target")
                break
        
        if target == "run_collections":
            run_args["collections"] = True
        elif target == "run_metadata":
            run_args["metadata"] = True
        elif target == "run_overlays":
            run_args["overlays"] = True
        elif target == "run_operations":
            run_args["operations"] = True
            
        # Run in a separate thread to not block API
        thread = threading.Thread(target=runner.process, args=(run_args,))
        thread.start()

        return {
            "status": "success",
            "message": f"Job {job_id} triggered",
            "data": {
                "job_id": job_id,
                "status": "queued"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
