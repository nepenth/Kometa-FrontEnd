import React, { useEffect, useRef, useState } from 'react';

import Editor, { OnMount } from '@monaco-editor/react';
import { Save, SmartButton } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';

import Loading from '../components/Loading';
import { fetchConfig, fetchConfigSchema, saveConfig } from '../features/config/configSlice';
import { useAppDispatch, useAppSelector } from '../store';

const ConfigEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, schema, loading, error } = useAppSelector((state) => state.config);
  const [editorValue, setEditorValue] = useState('');
  const editorRef = useRef<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    dispatch(fetchConfig());
    dispatch(fetchConfigSchema());
  }, [dispatch]);

  useEffect(() => {
    if (config?.data?.current_config) {
      setEditorValue(config.data.current_config);
    }
  }, [config]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure JSON schema validation if schema is available
    if (schema?.data) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'http://kometa/schema.json',
            fileMatch: ['*'],
            schema: schema.data,
          },
        ],
      });
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      dispatch(saveConfig(value));
    }
  };

  const handleSmartLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSmartLabelClose = (label?: string) => {
    setAnchorEl(null);
    if (label && editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits('smart-label', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: label,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    }
  };

  if (loading && !config) {
    return <Loading message="Loading configuration..." />;
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Configuration Editor</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<SmartButton />} onClick={handleSmartLabelClick}>
            Smart Labels
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleSmartLabelClose()}
          >
            <MenuItem onClick={() => handleSmartLabelClose('<<SmartLabel>>')}>
              Generic Smart Label
            </MenuItem>
            <MenuItem onClick={() => handleSmartLabelClose('<<Year>>')}>Year</MenuItem>
            <MenuItem onClick={() => handleSmartLabelClose('<<Month>>')}>Month</MenuItem>
            <MenuItem onClick={() => handleSmartLabelClose('<<Day>>')}>Day</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ flexGrow: 1, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Editor
          height="100%"
          defaultLanguage="yaml"
          theme="vs-dark"
          value={editorValue}
          onChange={(value) => setEditorValue(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </Paper>
    </Box>
  );
};

export default ConfigEditor;
