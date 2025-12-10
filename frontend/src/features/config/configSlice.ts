import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { apiService } from '../../services/api';
import { RootState } from '../../store';

interface ConfigResponse {
  status: string;
  message: string;
  data: {
    config_files: string[];
    current_config: string;
    config_content?: string;
  };
}

interface SchemaResponse {
  status: string;
  message: string;
  data: any; // Schema structure is complex, keeping any for data property is acceptable for now
}

interface ConfigStructureResponse {
  status: string;
  message: string;
  data: {
    libraries: Record<string, {
      collection_files: Array<{
        reference: string;
        type: string;
        path?: string;
        resolved_path?: string;
        exists: boolean;
        asset_directory?: string;
      }>;
      overlay_files: Array<{
        reference: string;
        type: string;
        path?: string;
        resolved_path?: string;
        exists: boolean;
      }>;
      metadata_files: Array<{
        reference: string;
        type: string;
        path?: string;
        resolved_path?: string;
        exists: boolean;
      }>;
      settings: Record<string, any>;
    }>;
    playlists: string[];
    settings: Record<string, any>;
  };
}

interface FileContentResponse {
  status: string;
  message: string;
  data: {
    path: string;
    resolved_path: string;
    type: string;
    content: string;
  };
}

interface ValidationResponse {
  status: string;
  message: string;
  data: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    structure: {
      has_libraries: boolean;
      library_count: number;
      has_playlists: boolean;
      has_settings: boolean;
    };
  };
}

interface ConfigState {
  config: ConfigResponse | null;
  schema: SchemaResponse | null;
  structure: ConfigStructureResponse | null;
  files: {
    config_files: Array<{
      path: string;
      type: string;
      full_path: string;
    }>;
    defaults_files: Array<{
      path: string;
      type: string;
      full_path: string;
    }>;
    total_files: number;
  } | null;
  fileContent: FileContentResponse | null;
  validation: ValidationResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: ConfigState = {
  config: null,
  schema: null,
  structure: null,
  files: null,
  fileContent: null,
  validation: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<ConfigResponse>('/config');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config');
    }
  }
);

export const fetchConfigSchema = createAsyncThunk(
  'config/fetchSchema',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<SchemaResponse>('/config/schema');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schema');
    }
  }
);

export const saveConfig = createAsyncThunk(
  'config/saveConfig',
  async (configContent: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<ConfigResponse>('/config', {
        config_name: 'config.yml',
        config_content: configContent,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save config');
    }
  }
);

export const fetchConfigStructure = createAsyncThunk(
  'config/fetchStructure',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<ConfigStructureResponse>('/config/structure');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config structure');
    }
  }
);

export const fetchConfigFiles = createAsyncThunk(
  'config/fetchFiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{
        status: string;
        message: string;
        data: {
          config_files: Array<{
            path: string;
            type: string;
            full_path: string;
          }>;
          defaults_files: Array<{
            path: string;
            type: string;
            full_path: string;
          }>;
          total_files: number;
        };
      }>('/config/files');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config files');
    }
  }
);

export const fetchFileContent = createAsyncThunk(
  'config/fetchFileContent',
  async (path: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<FileContentResponse>(`/config/file-content?path=${encodeURIComponent(path)}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch file content');
    }
  }
);

export const validateConfig = createAsyncThunk(
  'config/validateConfig',
  async (yamlContent: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<ValidationResponse>('/config/validate', {
        yaml_content: yamlContent,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate config');
    }
  }
);

export const validateReference = createAsyncThunk(
  'config/validateReference',
  async (reference: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<ValidationResponse>(`/config/validate/reference?reference=${encodeURIComponent(reference)}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate reference');
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    clearConfigError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload.data.config_content || null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConfigSchema.fulfilled, (state, action) => {
        state.schema = action.payload;
      })
      .addCase(saveConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload.data.config_content || null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(saveConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConfigStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.structure = action.payload;
      })
      .addCase(fetchConfigStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConfigFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload.data;
      })
      .addCase(fetchConfigFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFileContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileContent.fulfilled, (state, action) => {
        state.loading = false;
        state.fileContent = action.payload;
      })
      .addCase(fetchFileContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(validateConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.validation = action.payload;
      })
      .addCase(validateConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(validateReference.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateReference.fulfilled, (state, action) => {
        state.loading = false;
        state.validation = action.payload;
      })
      .addCase(validateReference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearConfigError } = configSlice.actions;
export default configSlice.reducer;
