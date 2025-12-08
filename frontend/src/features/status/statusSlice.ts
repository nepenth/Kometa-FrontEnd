import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'
import axios from 'axios'
import { RootState } from '../../store'

interface StatusState {
  version: string | null
  uptime: string | null
  lastRun: string | null
  nextRun: string | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

interface StatusResponse {
  status: string
  message: string
  data: {
    version: string
    uptime: string
    last_run: string | null
    next_run: string | null
  }
}

const initialState: StatusState = {
  version: null,
  uptime: null,
  lastRun: null,
  nextRun: null,
  loading: false,
  error: null,
  lastUpdated: null
}

export const fetchStatus = createAsyncThunk(
  'status/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<StatusResponse>('/status')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch status')
    }
  }
)

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    clearStatusError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStatus.fulfilled, (state, action) => {
        state.loading = false
        state.version = action.payload.version
        state.uptime = action.payload.uptime
        state.lastRun = action.payload.last_run
        state.nextRun = action.payload.next_run
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearStatusError } = statusSlice.actions
export default statusSlice.reducer