import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, Alert, CircularProgress, IconButton, Tooltip, List, ListItem, ListItemText, ListItemIcon, Chip, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { CheckCircle, Error, Warning, Refresh, ContentPaste, Code, ExpandMore, Info, Description } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Editor from '@monaco-editor/react';

const ValidationSystem: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [yamlContent, setYamlContent] = useState('');
  const [reference, setReference] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

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
    advanced: `name: Advanced Collection
type: collection
collection_mode: show
sort_by: originally_available_at
sort_order: desc
limit: 30
builders:
  - type: plex_search
    search:
      type: show
      genre: Drama
      content_rating: TV-MA
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
      size: 24
`,
    invalid: `name: Invalid Collection
type: collection
# Missing required fields
builders:
  - type: invalid_builder_type
    # Invalid builder configuration
`
  };

  const handleValidateYaml = () => {
    if (!yamlContent.trim()) {
      setSnackbarMessage('Please enter YAML content to validate');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      // Mock validation result
      const mockResult = {
        valid: true,
        errors: [],
        warnings: [],
        structure: {
          has_libraries: true,
          library_count: 1,
          has_playlists: false,
          has_settings: true
        },
        recommendations: [
          'Consider adding a description for better documentation',
          'You might want to add more specific filters for better results'
        ]
      };

      // Add some mock errors if content looks problematic
      if (yamlContent.includes('invalid_builder_type')) {
        mockResult.valid = false;
        mockResult.errors.push('Invalid builder type: invalid_builder_type');
        mockResult.errors.push('Builder configuration is incomplete');
      }

      if (!yamlContent.includes('name:')) {
        mockResult.valid = false;
        mockResult.errors.push('Missing required field: name');
      }

      if (!yamlContent.includes('type:')) {
        mockResult.valid = false;
        mockResult.errors.push('Missing required field: type');
      }

      setValidationResult(mockResult);
      setSnackbarMessage('Validation completed!');
      setSnackbarSeverity(mockResult.valid ? 'success' : 'error');
      setSnackbarOpen(true);
    }, 1000);
  };

  const handleValidateReference = () => {
    if (!reference.trim()) {
      setSnackbarMessage('Please enter a reference to validate');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      // Mock validation result
      const mockResult = {
        valid: true,
        errors: [],
        warnings: [],
        resolved_path: `/config/defaults/${reference.split(':')[1].trim()}.yml`,
        exists: true
      };

      // Add some mock errors if reference looks problematic
      if (reference.includes('invalid')) {
        mockResult.valid = false;
        mockResult.errors.push('Reference contains invalid characters');
        mockResult.exists = false;
      }

      if (!reference.includes(':')) {
        mockResult.valid = false;
        mockResult.errors.push('Reference must be in format "type: name"');
      }

      setValidationResult(mockResult);
      setSnackbarMessage('Reference validation completed!');
      setSnackbarSeverity(mockResult.valid ? 'success' : 'error');
      setSnackbarOpen(true);
    }, 1000);
  };

  const handleLoadSample = (sampleKey: keyof typeof sampleTemplates) => {
    setYamlContent(sampleTemplates[sampleKey]);
    setSnackbarMessage(`Loaded ${sampleKey} sample template`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const getValidationSummary = () => {
    if (!validationResult) return null;

    const hasErrors = validationResult.errors && validationResult.errors.length > 0;
    const hasWarnings = validationResult.warnings && validationResult.warnings.length > 0;

    return (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity={
            hasErrors ? 'error' :
            hasWarnings ? 'warning' : 'success'
          }
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              {validationResult.valid ? 'Validation Successful' : 'Validation Failed'}
            </Typography>
            {hasErrors && <Chip label={`${validationResult.errors.length} error(s)`} color="error" size="small" />}
            {hasWarnings && <Chip label={`${validationResult.warnings.length} warning(s)`} color="warning" size="small" />}
          </Box>
        </Alert>

        {validationResult.structure && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Structure Analysis</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Libraries: ${validationResult.structure.library_count}`}
                color={validationResult.structure.has_libraries ? 'success' : 'error'}
                size="small"
              />
              <Chip
                label={`Playlists: ${validationResult.structure.has_playlists ? 'Yes' : 'No'}`}
                color={validationResult.structure.has_playlists ? 'success' : 'info'}
                size="small"
              />
              <Chip
                label={`Settings: ${validationResult.structure.has_settings ? 'Yes' : 'No'}`}
                color={validationResult.structure.has_settings ? 'success' : 'info'}
                size="small"
              />
            </Box>
          </Paper>
        )}
      </Box>
    );
  };

  const getErrorDetails = () => {
    if (!validationResult || validationResult.errors.length === 0) return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" color="error">Errors ({validationResult.errors.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {validationResult.errors.map((error: string, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" color="error">{error}</Typography>}
                  />
                </ListItem>
                {index < validationResult.errors.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  const getWarningDetails = () => {
    if (!validationResult || validationResult.warnings.length === 0) return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" color="warning">Warnings ({validationResult.warnings.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {validationResult.warnings.map((warning: string, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" color="warning">{warning}</Typography>}
                  />
                </ListItem>
                {index < validationResult.warnings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  const getRecommendations = () => {
    if (!validationResult || !validationResult.recommendations || validationResult.recommendations.length === 0) return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" color="info">Recommendations ({validationResult.recommendations.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {validationResult.recommendations.map((recommendation: string, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">{recommendation}</Typography>}
                  />
                </ListItem>
                {index < validationResult.recommendations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  const getReferenceValidation = () => {
    if (!validationResult || activeTab !== 1) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity={validationResult.valid ? 'success' : 'error'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">
            {validationResult.valid ? 'Reference is valid' : 'Reference validation failed'}
          </Typography>
        </Alert>

        {validationResult.resolved_path && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Reference Details</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Reference:</Typography>
                <Typography variant="body2">{reference}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Resolved Path:</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{validationResult.resolved_path}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Chip
                  label={validationResult.exists ? 'Found' : 'Not Found'}
                  color={validationResult.exists ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Configuration Validation System
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => {
          setActiveTab(newValue);
          setValidationResult(null);
        }} aria-label="validation tabs">
          <Tab label="YAML Validation" />
          <Tab label="Reference Validation" />
        </Tabs>
      </Paper>

      {/* YAML Validation Tab */}
      {activeTab === 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">YAML Content Editor</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPaste />}
                onClick={() => handleLoadSample('basic')}
              >
                Basic Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPaste />}
                onClick={() => handleLoadSample('advanced')}
              >
                Advanced Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPaste />}
                onClick={() => handleLoadSample('invalid')}
              >
                Invalid Sample
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, position: 'relative', mb: 2 }}>
            <Editor
              height="400px"
              language="yaml"
              value={yamlContent}
              onChange={(value) => setYamlContent(value || '')}
              options={editorOptions}
              loading={<CircularProgress />}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setYamlContent('')}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleValidateYaml}
              disabled={loading || !yamlContent.trim()}
            >
              Validate YAML
            </Button>
          </Box>
        </Box>
      )}

      {/* Reference Validation Tab */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            Validate file references (e.g., "default: Basic", "file: /path/to/file.yml")
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter reference to validate (e.g., default: Basic)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1 }}>
                  <Code color="action" />
                </Box>
              )
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setReference('')}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleValidateReference}
              disabled={loading || !reference.trim()}
            >
              Validate Reference
            </Button>
          </Box>
        </Box>
      )}

      {/* Validation Results */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {validationResult && (
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 ? getValidationSummary() : getReferenceValidation()}

          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getErrorDetails()}
              {getWarningDetails()}
              {getRecommendations()}
            </Box>
          )}
        </Box>
      )}

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

export default ValidationSystem;