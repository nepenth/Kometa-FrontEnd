from fastapi import APIRouter, Depends
from typing import Dict, Any
from datetime import datetime, timedelta
from .auth import get_current_user, User

router = APIRouter()

@router.get("/scheduler/jobs", response_model=Dict[str, Any])
async def get_scheduler_jobs(current_user: User = Depends(get_current_user)):
    # Mock jobs
    return {
        "status": "success",
        "message": "Jobs retrieved",
        "data": [
            {
                "id": "plex_sync",
                "name": "Plex Sync",
                "schedule": "0 4 * * *",
                "next_run": (datetime.now() + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
                "last_run": (datetime.now() - timedelta(hours=20)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "idle"
            },
            {
                "id": "trakt_sync",
                "name": "Trakt Sync",
                "schedule": "0 5 * * *",
                "next_run": (datetime.now() + timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
                "last_run": (datetime.now() - timedelta(hours=19)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "idle"
            },
            {
                "id": "overlays",
                "name": "Apply Overlays",
                "schedule": "0 2 * * *",
                "next_run": (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                "last_run": (datetime.now() - timedelta(hours=22)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "running"
            }
        ]
    }

@router.post("/scheduler/trigger/{job_id}", response_model=Dict[str, Any])
async def trigger_job(job_id: str, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"Job {job_id} triggered",
        "data": {
            "job_id": job_id,
            "status": "queued"
        }
    }

@router.post("/scheduler/schedule/{job_id}", response_model=Dict[str, Any])
async def update_schedule(job_id: str, schedule: str, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"Schedule for {job_id} updated to {schedule}",
        "data": {
            "job_id": job_id,
            "schedule": schedule
        }
    }
