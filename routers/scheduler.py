import schedule
import time
import threading
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
from .auth import get_current_user, User
from modules import runner

router = APIRouter()

# Helper to get jobs from schedule library
def get_jobs_info():
    jobs = []
    for job in schedule.jobs:
        # Try to extract job name or ID if possible, otherwise generate one
        job_name = "Unknown Job"
        if job.tags:
            job_name = list(job.tags)[0]
        
        next_run = job.next_run
        last_run = job.last_run
        
        jobs.append({
            "id": job_name, # Using tag as ID for now
            "name": job_name,
            "schedule": str(job.period) + " " + str(job.unit), # Rough approximation
            "next_run": next_run.strftime("%Y-%m-%d %H:%M:%S") if next_run else None,
            "last_run": last_run.strftime("%Y-%m-%d %H:%M:%S") if last_run else None,
            "status": "idle" # schedule lib doesn't track running status easily
        })
    return jobs

@router.get("/scheduler/jobs", response_model=Dict[str, Any])
async def get_scheduler_jobs(current_user: User = Depends(get_current_user)):
    try:
        jobs = get_jobs_info()
        return {
            "status": "success",
            "message": "Jobs retrieved",
            "data": jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scheduler/trigger/{job_id}", response_model=Dict[str, Any])
async def trigger_job(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Logic to trigger a specific job
        # For Kometa, we might want to trigger a run immediately using runner.process
        # Parsing job_id to determine what to run
        
        run_args = {}
        if job_id == "run_collections":
            run_args["collections"] = True
        elif job_id == "run_metadata":
            run_args["metadata"] = True
        elif job_id == "run_overlays":
            run_args["overlays"] = True
        elif job_id == "run_operations":
            run_args["operations"] = True
        else:
            # Default run
            pass
            
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

@router.post("/scheduler/schedule/{job_id}", response_model=Dict[str, Any])
async def update_schedule(job_id: str, schedule_str: str, current_user: User = Depends(get_current_user)):
    # Updating schedule dynamically is complex with the 'schedule' library as it requires clearing and re-adding.
    # For now, we will return a not implemented message or mock success if we can't easily do it.
    return {
        "status": "success",
        "message": f"Schedule update for {job_id} not yet fully implemented",
        "data": {
            "job_id": job_id,
            "schedule": schedule_str
        }
    }
