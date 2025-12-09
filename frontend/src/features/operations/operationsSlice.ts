import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { apiService } from '../../services/api';
import { RootState } from '../../store';

interface Operation {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  result: any | null;
  error: string | null;
}

interface OperationsState {
  operations: Operation[];
  availableOperations: string[];
  loading: boolean;
  error: string | null;
}

interface OperationRequest {
  operation_type: string;
  parameters: Record<string, any>;
}

interface OperationResponse {
  status: string;
  message: string;
  data: {
    operation_id: string;
    status: string;
  };
}

const initialState: OperationsState = {
  operations: [],
  availableOperations: [],
  loading: false,
  error: null,
};

export const fetchAvailableOperations = createAsyncThunk(
  'operations/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any>('/operations');
      // The API returns { status, message, data: { operations: [] } }
      // apiService.get returns response.data, so we have the full object
      return response.data.operations;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch operations');
    }
  }
);

export const runOperation = createAsyncThunk(
  'operations/run',
  async (operationRequest: OperationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<OperationResponse>('/operations', operationRequest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run operation');
    }
  }
);

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    clearOperationsError: (state) => {
      state.error = null;
    },
    updateOperationStatus: (state, action) => {
      const { operationId, status, progress } = action.payload;
      const operation = state.operations.find((op) => op.id === operationId);
      if (operation) {
        operation.status = status;
        operation.progress = progress;
        if (status === 'completed') {
          operation.completedAt = new Date().toISOString();
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableOperations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableOperations.fulfilled, (state, action) => {
        state.loading = false;
        state.availableOperations = action.payload.operations || [];
      })
      .addCase(fetchAvailableOperations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(runOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runOperation.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.push({
          id: action.payload.operation_id,
          type: action.meta.arg.operation_type,
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          completedAt: null,
          result: null,
          error: null,
        });
      })
      .addCase(runOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOperationsError, updateOperationStatus } = operationsSlice.actions;
export default operationsSlice.reducer;
