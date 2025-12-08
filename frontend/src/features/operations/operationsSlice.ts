import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from '../../store'

interface Operation {
  id: string
  type: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  startedAt: string | null
  completedAt: string | null
  result: any | null
  error: string | null
}

interface OperationsState {
  operations: Operation[]
  availableOperations: string[]
  loading: boolean
  error: string | null
}

interface OperationRequest {
  operation_type: string
  parameters: Record<string, any>
}

interface OperationResponse {
  status: string
  message: string
  data: {
    operation_id: string
    status: string
  }
}

const initialState: OperationsState = {
  operations: [],
  availableOperations: [],
  loading: false,
  error: null
}

export const fetchAvailableOperations = createAsyncThunk(
  'operations/fetchAvailable',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState
      const response = await axios.get<OperationResponse>('/api/v1/operations', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch operations')
      }
      return rejectWithValue('An unknown error occurred')
    }
  }
)

export const runOperation = createAsyncThunk(
  'operations/run',
  async (operationRequest: OperationRequest, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState
      const response = await axios.post<OperationResponse>(
        '/api/v1/operations',
        operationRequest,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to run operation')
      }
      return rejectWithValue('An unknown error occurred')
    }
  }
)

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    clearOperationsError: (state) => {
      state.error = null
    },
    updateOperationStatus: (state, action) => {
      const { operationId, status, progress } = action.payload
      const operation = state.operations.find(op => op.id === operationId)
      if (operation) {
        operation.status = status
        operation.progress = progress
        if (status === 'completed') {
          operation.completedAt = new Date().toISOString()
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableOperations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableOperations.fulfilled, (state, action) => {
        state.loading = false
        state.availableOperations = action.payload.operations || []
      })
      .addCase(fetchAvailableOperations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(runOperation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(runOperation.fulfilled, (state, action) => {
        state.loading = false
        state.operations.push({
          id: action.payload.operation_id,
          type: action.meta.arg.operation_type,
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          completedAt: null,
          result: null,
          error: null
        })
      })
      .addCase(runOperation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearOperationsError, updateOperationStatus } = operationsSlice.actions
export default operationsSlice.reducer