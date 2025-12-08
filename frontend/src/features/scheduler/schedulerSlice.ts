import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

interface Job {
    id: string
    name: string
    schedule: string
    next_run: string
    last_run: string
    status: 'idle' | 'running' | 'queued' | 'failed'
}

interface SchedulerState {
    jobs: Job[]
    loading: boolean
    error: string | null
}

const initialState: SchedulerState = {
    jobs: [],
    loading: false,
    error: null
}

export const fetchJobs = createAsyncThunk(
    'scheduler/fetchJobs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get<any>('/scheduler/jobs')
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs')
        }
    }
)

export const triggerJob = createAsyncThunk(
    'scheduler/triggerJob',
    async (jobId: string, { rejectWithValue }) => {
        try {
            const response = await apiService.post<any>(`/scheduler/trigger/${jobId}`)
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to trigger job')
        }
    }
)

export const updateSchedule = createAsyncThunk(
    'scheduler/updateSchedule',
    async ({ jobId, schedule }: { jobId: string; schedule: string }, { rejectWithValue }) => {
        try {
            const response = await apiService.post<any>(`/scheduler/schedule/${jobId}?schedule=${encodeURIComponent(schedule)}`)
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update schedule')
        }
    }
)

const schedulerSlice = createSlice({
    name: 'scheduler',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false
                state.jobs = action.payload
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(triggerJob.fulfilled, (state, action) => {
                const job = state.jobs.find(j => j.id === action.payload.job_id)
                if (job) {
                    job.status = 'queued'
                }
            })
            .addCase(updateSchedule.fulfilled, (state, action) => {
                const job = state.jobs.find(j => j.id === action.payload.job_id)
                if (job) {
                    job.schedule = action.payload.schedule
                }
            })
    }
})

export default schedulerSlice.reducer
