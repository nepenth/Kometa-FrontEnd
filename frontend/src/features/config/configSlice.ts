import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'
import axios from 'axios'
import { RootState } from '../../store'

interface ConfigState {
  config: any
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

interface ConfigResponse {
  status: string
  message: string
  data: {
    config_files: string[]
    current_config: string
    config_content?: string
  }
}

const initialState: ConfigState = {
  config: null,
  loading: false,
  error: null,
  lastUpdated: null
}

export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<ConfigResponse>('/config')
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config')
    }
  }
)

export const saveConfig = createAsyncThunk(
  'config/saveConfig',
  async (configContent: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<ConfigResponse>(
        '/config',
        { config_name: 'config.yml', config_content: configContent }
      )
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save config')
    }
  }
)

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    clearConfigError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false
        state.config = action.payload.data.config_content || null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(saveConfig.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveConfig.fulfilled, (state, action) => {
        state.loading = false
        state.config = action.payload.data.config_content || null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(saveConfig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearConfigError } = configSlice.actions
export default configSlice.reducer