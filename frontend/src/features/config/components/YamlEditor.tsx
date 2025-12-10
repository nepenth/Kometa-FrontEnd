import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { fetchConfig, saveConfig, validateConfig, fetchFileContent } from '../configSlice';
import { Box, Typography, Button, CircularProgress, Alert, Chip, Snackbar, IconButton, Tooltip, Tabs, Tab, Paper } from '@mui/material';
import { Save, CheckCircle, Error, Warning, ContentCopy, Refresh, FileOpen } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';

const YamlEditor: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { config, fileContent, validation, loading, error } = useSelector((state: RootState) => state.config);
  const [editorValue, setEditorValue] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [filePath, setFilePath] = useState('config.yml');

  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config?.data?.config_content) {
      setEditorValue(config.data.config_content);
    }
  }, [config]);

  useEffect(() => {
    if (fileContent?.data?.content) {
      setEditorValue(fileContent.data.content);
    }
  }, [fileContent]);

  const handleSave = async () => {
    try {
      await dispatch(saveConfig(editorValue) as any);
      setSnackbarMessage('Configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to save configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleValidate = async () => {
    try {
      await dispatch(validateConfig(editorValue) as any);
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  const handleLoadFile = () => {
    dispatch(fetchFileContent(filePath) as any);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editorValue);
    setSnackbarMessage('Copied to clipboard!');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleRefresh = () => {
    if (activeTab === 0) {
      dispatch(fetchConfig());
    } else {
      dispatch(fetchFileContent(filePath) as any);
    }
  };

  const getValidationStatus = () => {
    if (!validation) return null;

    const hasErrors = validation.data.errors.length > 0;
    const hasWarnings = validation.data.warnings.length > 0;

    if (hasErrors) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">Validation failed with {validation.data.errors.length} error(s)</Typography>
          {validation.data.errors.slice(0, 3).map((error, index) => (
            <Typography key={index} variant="caption" color="error">{error}</Typography>
          ))}
          {validation.data.errors.length > 3 && (
            <Typography variant="caption">... and {validation.data.errors.length - 3} more</Typography>
          )}
        </Alert>
      );
    } else if (hasWarnings) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">Validation completed with {validation.data.warnings.length} warning(s)</Typography>
          {validation.data.warnings.slice(0, 3).map((warning, index) => (
            <Typography key={index} variant="caption" color="warning">{warning}</Typography>
          ))}
          {validation.data.warnings.length > 3 && (
            <Typography variant="caption">... and {validation.data.warnings.length - 3} more</Typography>
          )}
        </Alert>
      );
    } else {
      return (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">Configuration is valid</Typography>
        </Alert>
      );
    }
  };

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: 'on',
    wrappingIndent: 'same',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    theme: theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light',
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        YAML Configuration Editor
      </Typography>

      <Paper sx={{ mb: 2, p: 1 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="editor tabs">
          <Tab label="Main Config" />
          <Tab label="File Browser" />
        </Tabs>

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Typography variant="body2">File Path:</Typography>
            <Box sx={{ flex: 1 }}>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                }}
              />
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileOpen />}
              onClick={handleLoadFile}
              disabled={loading}
            >
              Load File
            </Button>
          </Box>
        )}
      </Paper>

      {/* Validation Status */}
      {validation && getValidationStatus()}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Editor Container */}
      <Box sx={{ flex: 1, position: 'relative', mb: 2 }}>
        <Editor
          height="100%"
          language="yaml"
          value={editorValue}
          onChange={(value) => setEditorValue(value || '')}
          options={editorOptions}
          loading={<CircularProgress />}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Tooltip title="Copy to clipboard">
          <IconButton onClick={handleCopyToClipboard} color="primary">
            <ContentCopy />
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          startIcon={<CheckCircle />}
          onClick={handleValidate}
          disabled={loading}
        >
          Validate
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={loading}
        >
          Save Configuration
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YamlEditor;