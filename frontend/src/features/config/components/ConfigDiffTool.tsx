import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, TextField, Alert, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider } from '@mui/material';
import { ContentPaste, Compare, Refresh, Save, ContentCopy, CheckCircle, Error, Warning, Info, Description } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Editor from '@monaco-editor/react';
import { DiffEditor } from '@monaco-editor/react';

const ConfigDiffTool: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [originalContent, setOriginalContent] = useState('');
  const [modifiedContent, setModifiedContent] = useState('');
  const [diffResult, setDiffResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const sampleTemplates = {
    basic: `name: My Collection
type: collection
collection_mode: default
sort_by: title
sort_order: asc
limit: 20
builders:
  - type: plex_search
    search:
      type: movie
      genre: Action
      decade: 2020s`,
    advanced: `name: My Collection
type: collection
collection_mode: default
sort_by: originally_available_at
sort_order: desc
limit: 30
builders:
  - type: plex_search
    search:
      type: movie
      genre: Drama
      decade: 2020s
  - type: tmdb_popular
    limit: 10
    sort_by: popularity
    sort_order: desc
overlays:
  - type: text
    text: "Popular"
    position: top_right
    style:
      color: "#FF0000"
      size: 24`
  };

  const handleLoadSample = (sampleKey: keyof typeof sampleTemplates, target: 'original' | 'modified') => {
    const content = sampleTemplates[sampleKey];
    if (target === 'original') {
      setOriginalContent(content);
    } else {
      setModifiedContent(content);
    }
    setSnackbarMessage(`Loaded ${sampleKey} sample to ${target}`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleCompare = () => {
    if (!originalContent.trim() || !modifiedContent.trim()) {
      setSnackbarMessage('Both original and modified content are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    // Simulate API call for diff analysis
    setTimeout(() => {
      setLoading(false);

      // Mock diff analysis result
      const mockResult = {
        changes: {
          added: 0,
          removed: 0,
          modified: 0,
          unchanged: 0
        },
        statistics: {
          lines_added: 0,
          lines_removed: 0,
          lines_changed: 0,
          similarity: 100
        },
        warnings: [],
        errors: []
      };

      // Simple line-based comparison
      const originalLines = originalContent.split('\n');
      const modifiedLines = modifiedContent.split('\n');

      mockResult.changes.added = Math.max(0, modifiedLines.length - originalLines.length);
      mockResult.changes.removed = Math.max(0, originalLines.length - modifiedLines.length);

      // Count actual differences
      let differences = 0;
      const maxLength = Math.max(originalLines.length, modifiedLines.length);
      for (let i = 0; i < maxLength; i++) {
        if (originalLines[i] !== modifiedLines[i]) {
          differences++;
        }
      }

      mockResult.changes.modified = differences;
      mockResult.changes.unchanged = maxLength - differences;

      // Calculate statistics
      mockResult.statistics.lines_added = mockResult.changes.added;
      mockResult.statistics.lines_removed = mockResult.changes.removed;
      mockResult.statistics.lines_changed = mockResult.changes.modified;
      mockResult.statistics.similarity = Math.round(
        (mockResult.changes.unchanged / maxLength) * 100
      );

      // Add warnings if significant changes
      if (mockResult.statistics.similarity < 70) {
        mockResult.warnings.push('Significant differences detected - review carefully');
      }

      if (mockResult.statistics.lines_removed > 5) {
        mockResult.warnings.push('Large number of lines removed - verify this is intentional');
      }

      setDiffResult(mockResult);
      setSnackbarMessage('Comparison completed!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 1000);
  };

  const handleSaveDiff = () => {
    if (!saveName.trim()) {
      setSnackbarMessage('Please enter a name for the diff');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // In a real implementation, this would save to backend
    setSnackbarMessage(`Diff saved as "${saveName}"`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setOpenSaveDialog(false);
    setSaveName('');
  };

  const handleCopyDiff = () => {
    const diffText = `=== DIFF ANALYSIS ===\n\n` +
                    `Changes:\n` +
                    `- Added: ${diffResult?.changes.added || 0} lines\n` +
                    `- Removed: ${diffResult?.changes.removed || 0} lines\n` +
                    `- Modified: ${diffResult?.changes.modified || 0} lines\n` +
                    `- Unchanged: ${diffResult?.changes.unchanged || 0} lines\n\n` +
                    `Statistics:\n` +
                    `- Similarity: ${diffResult?.statistics.similarity || 100}%\n` +
                    `- Total lines added: ${diffResult?.statistics.lines_added || 0}\n` +
                    `- Total lines removed: ${diffResult?.statistics.lines_removed || 0}\n` +
                    `- Total lines changed: ${diffResult?.statistics.lines_changed || 0}`;

    navigator.clipboard.writeText(diffText);
    setSnackbarMessage('Diff analysis copied to clipboard!');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const getDiffSummary = () => {
    if (!diffResult) return null;

    const hasWarnings = diffResult.warnings && diffResult.warnings.length > 0;
    const hasErrors = diffResult.errors && diffResult.errors.length > 0;

    const severity = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';

    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity={severity} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              Comparison Results: {diffResult.statistics.similarity}% Similarity
            </Typography>
            {hasWarnings && <Chip label={`${diffResult.warnings.length} warning(s)`} color="warning" size="small" />}
            {hasErrors && <Chip label={`${diffResult.errors.length} error(s)`} color="error" size="small" />}
          </Box>
        </Alert>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Change Summary</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Added: ${diffResult.changes.added}`}
              color={diffResult.changes.added > 0 ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label={`Removed: ${diffResult.changes.removed}`}
              color={diffResult.changes.removed > 0 ? 'error' : 'default'}
              size="small"
            />
            <Chip
              label={`Modified: ${diffResult.changes.modified}`}
              color={diffResult.changes.modified > 0 ? 'warning' : 'default'}
              size="small"
            />
            <Chip
              label={`Unchanged: ${diffResult.changes.unchanged}`}
              color="success"
              size="small"
            />
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Similarity: ${diffResult.statistics.similarity}%`}
              color={diffResult.statistics.similarity >= 80 ? 'success' : 'warning'}
              size="small"
            />
            <Chip
              label={`Lines Added: ${diffResult.statistics.lines_added}`}
              color={diffResult.statistics.lines_added > 0 ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label={`Lines Removed: ${diffResult.statistics.lines_removed}`}
              color={diffResult.statistics.lines_removed > 0 ? 'error' : 'default'}
              size="small"
            />
            <Chip
              label={`Lines Changed: ${diffResult.statistics.lines_changed}`}
              color={diffResult.statistics.lines_changed > 0 ? 'warning' : 'default'}
              size="small"
            />
          </Box>
        </Paper>
      </Box>
    );
  };

  const getWarningsAndErrors = () => {
    if (!diffResult) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {diffResult.warnings.length > 0 && (
          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>Warnings</Typography>
            <List dense>
              {diffResult.warnings.map((warning: string, index: number) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                    <Warning color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {diffResult.errors.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle2" gutterBottom>Errors</Typography>
            <List dense>
              {diffResult.errors.map((error: string, index: number) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                    <Error color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </Box>
    );
  };

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: 'on',
    wrappingIndent: 'same',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 13,
    tabSize: 2,
    theme: theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light',
  };

  const diffEditorOptions = {
    ...editorOptions,
    readOnly: true,
    renderSideBySide: true,
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Configuration Diff Tool
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="diff tabs">
          <Tab label="Side-by-Side Comparison" />
          <Tab label="Inline Diff" />
        </Tabs>
      </Paper>

      {/* Side-by-Side Comparison */}
      {activeTab === 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Original vs Modified Configuration</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPaste />}
                onClick={() => handleLoadSample('basic', 'original')}
              >
                Basic Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPaste />}
                onClick={() => handleLoadSample('advanced', 'modified')}
              >
                Advanced Sample
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, flex: 1, mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Original Configuration</Typography>
              <Box sx={{ height: '400px', position: 'relative' }}>
                <Editor
                  height="100%"
                  language="yaml"
                  value={originalContent}
                  onChange={(value) => setOriginalContent(value || '')}
                  options={editorOptions}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Modified Configuration</Typography>
              <Box sx={{ height: '400px', position: 'relative' }}>
                <Editor
                  height="100%"
                  language="yaml"
                  value={modifiedContent}
                  onChange={(value) => setModifiedContent(value || '')}
                  options={editorOptions}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setOriginalContent('');
                setModifiedContent('');
                setDiffResult(null);
              }}
              disabled={loading}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              startIcon={<Compare />}
              onClick={handleCompare}
              disabled={loading || !originalContent.trim() || !modifiedContent.trim()}
            >
              Compare Configurations
            </Button>
          </Box>
        </Box>
      )}

      {/* Inline Diff View */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" gutterBottom>Inline Diff View</Typography>

          <Box sx={{ flex: 1, position: 'relative', mb: 2 }}>
            <DiffEditor
              height="100%"
              language="yaml"
              original={originalContent}
              modified={modifiedContent}
              options={diffEditorOptions}
              loading={<CircularProgress />}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopyDiff}
              disabled={!diffResult}
            >
              Copy Diff Analysis
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => setOpenSaveDialog(true)}
              disabled={!diffResult}
            >
              Save Diff
            </Button>
          </Box>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Diff Results */}
      {diffResult && getDiffSummary()}
      {diffResult && getWarningsAndErrors()}

      {/* Save Diff Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Save Diff Configuration</DialogTitle>
        <DialogContent sx={{ minWidth: '400px' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Diff Name"
            type="text"
            fullWidth
            variant="outlined"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g., Collection Updates - 2024-01-15"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveDiff}
            disabled={!saveName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

export default ConfigDiffTool;