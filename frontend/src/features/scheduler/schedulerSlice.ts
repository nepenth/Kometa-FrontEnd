import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

export interface Job {
    id: string
    name: string
    type: 'interval' | 'daily'
    value: string
    unit: 'minutes' | 'hours' | 'days'
    target: string
    next_run?: string
    last_run?: string
    status: string
    schedule: string // Display string
}

export interface SchedulerState {
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

export const createJob = createAsyncThunk('scheduler/createJob', async (jobData: Partial<Job>, { rejectWithValue }) => {
    try {
        const response = await apiService.post('/scheduler/jobs', jobData)
        return response.data
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create job')
    }
})

export const updateJob = createAsyncThunk('scheduler/updateJob', async ({ id, data }: { id: string, data: Partial<Job> }, { rejectWithValue }) => {
    try {
        const response = await apiService.put(`/scheduler/jobs/${id}`, data)
        return response.data
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update job')
    }
})

export const deleteJob = createAsyncThunk('scheduler/deleteJob', async (id: string, { rejectWithValue }) => {
    try {
        await apiService.delete(`/scheduler/jobs/${id}`)
        return id
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete job')
    }
})

export const triggerJob = createAsyncThunk('scheduler/triggerJob', async (jobId: string, { rejectWithValue }) => {
    try {
        const response = await apiService.post(`/scheduler/trigger/${jobId}`)
        return { jobId, status: response.data.status }
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to trigger job')
    }
})

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
            .addCase(createJob.fulfilled, (state, action) => {
                state.jobs.push(action.payload)
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                const index = state.jobs.findIndex(j => j.id === action.payload.id)
                if (index !== -1) {
                    state.jobs[index] = action.payload
                }
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.jobs = state.jobs.filter(j => j.id !== action.payload)
            })
            .addCase(triggerJob.fulfilled, (state, action) => {
                const job = state.jobs.find(j => j.id === action.payload.jobId)
                if (job) {
                    job.status = action.payload.status
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
