import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { apiService } from '../../services/api.js';

export interface Library {
  name: string;
  config: any;
}

export interface LibrariesState {
  libraries: Library[];
  currentLibrary: Library | null;
  loading: boolean;
  error: string | null;
}

const initialState: LibrariesState = {
  libraries: [],
  currentLibrary: null,
  loading: false,
  error: null,
};

export const fetchLibraries = createAsyncThunk(
  'libraries/fetchLibraries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any>('/libraries');
      return response.data.libraries;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch libraries');
    }
  }
);

export const fetchLibrary = createAsyncThunk(
  'libraries/fetchLibrary',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any>(`/libraries/${name}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch library');
    }
  }
);

export const runLibrary = createAsyncThunk(
  'libraries/runLibrary',
  async (
    { name, ignore_schedules }: { name: string; ignore_schedules?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post<any>(`/libraries/${name}/run`, { ignore_schedules });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run library');
    }
  }
);

const librariesSlice = createSlice({
  name: 'libraries',
  initialState,
  reducers: {
    clearCurrentLibrary: (state: LibrariesState) => {
      state.currentLibrary = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<LibrariesState>) => {
    builder
      .addCase(fetchLibraries.pending, (state: LibrariesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLibraries.fulfilled,
        (state: LibrariesState, action: PayloadAction<Library[]>) => {
          state.loading = false;
          state.libraries = action.payload;
        }
      )
      .addCase(fetchLibraries.rejected, (state: LibrariesState, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLibrary.pending, (state: LibrariesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibrary.fulfilled, (state: LibrariesState, action: PayloadAction<Library>) => {
        state.loading = false;
        state.currentLibrary = action.payload;
      })
      .addCase(fetchLibrary.rejected, (state: LibrariesState, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentLibrary } = librariesSlice.actions;
export default librariesSlice.reducer;
