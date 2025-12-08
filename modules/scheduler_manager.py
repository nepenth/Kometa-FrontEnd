import schedule
import time
import threading
import os
from ruamel.yaml import YAML
from datetime import datetime
from modules import runner

class SchedulerManager:
    def __init__(self, config_path="config/schedules.yaml"):
        self.config_path = config_path
        self.yaml = YAML()
        self.yaml.preserve_quotes = True
        self.jobs_config = []
        self.running = False
        self.thread = None
        self._load_config()

    def _load_config(self):
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                self.jobs_config = self.yaml.load(f) or []
        else:
            self.jobs_config = []
            # Create default empty config if not exists
            self._save_config()

    def _save_config(self):
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w') as f:
            self.yaml.dump(self.jobs_config, f)

    def start(self):
        if self.running:
            return
        self.running = True
        self._init_jobs()
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()

    def _run_loop(self):
        while self.running:
            schedule.run_pending()
            time.sleep(1)

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

    def _init_jobs(self):
        schedule.clear()
        for job_data in self.jobs_config:
            self._schedule_job(job_data)

    def _schedule_job(self, job_data):
        job_id = job_data.get("id")
        job_type = job_data.get("type", "interval") # interval, daily, cron (cron not fully supported by simple schedule lib, using interval/daily for now)
        value = job_data.get("value") # e.g., "10" for minutes, "10:30" for daily
        unit = job_data.get("unit", "minutes") # minutes, hours, days
        target = job_data.get("target", "run_operations") # what to run

        # Define the job function
        def job_func():
            print(f"Executing scheduled job: {job_id} -> {target}")
            run_args = {}
            if target == "run_collections":
                run_args["collections"] = True
            elif target == "run_metadata":
                run_args["metadata"] = True
            elif target == "run_overlays":
                run_args["overlays"] = True
            elif target == "run_operations":
                run_args["operations"] = True
            
            # Run in separate thread to avoid blocking scheduler loop
            threading.Thread(target=runner.process, args=(run_args,)).start()

        # Schedule it
        if job_type == "interval":
            val = int(value)
            if unit == "minutes":
                schedule.every(val).minutes.do(job_func).tag(job_id)
            elif unit == "hours":
                schedule.every(val).hours.do(job_func).tag(job_id)
            elif unit == "days":
                schedule.every(val).days.do(job_func).tag(job_id)
        elif job_type == "daily":
            schedule.every().day.at(value).do(job_func).tag(job_id)

    def add_job(self, job_data):
        # Generate ID if missing
        if "id" not in job_data:
            job_data["id"] = f"job_{int(time.time())}"
        
        self.jobs_config.append(job_data)
        self._save_config()
        self._schedule_job(job_data)
        return job_data

    def delete_job(self, job_id):
        self.jobs_config = [j for j in self.jobs_config if j.get("id") != job_id]
        self._save_config()
        schedule.clear(job_id)

    def update_job(self, job_id, new_data):
        for i, job in enumerate(self.jobs_config):
            if job.get("id") == job_id:
                self.jobs_config[i] = new_data
                self.jobs_config[i]["id"] = job_id # Ensure ID doesn't change
                self._save_config()
                
                # Reschedule
                schedule.clear(job_id)
                self._schedule_job(self.jobs_config[i])
                return self.jobs_config[i]
        return None

    def get_jobs(self):
        # Return config data merged with runtime status
        jobs = []
        for job_config in self.jobs_config:
            job_id = job_config.get("id")
            # Find runtime job
            runtime_job = next((j for j in schedule.jobs if job_id in j.tags), None)
            
            job_info = job_config.copy()
            if runtime_job:
                job_info["next_run"] = runtime_job.next_run.strftime("%Y-%m-%d %H:%M:%S") if runtime_job.next_run else None
                job_info["last_run"] = runtime_job.last_run.strftime("%Y-%m-%d %H:%M:%S") if runtime_job.last_run else None
            else:
                job_info["status"] = "inactive"
            
            jobs.append(job_info)
        return jobs

# Global instance
scheduler_manager = SchedulerManager()
