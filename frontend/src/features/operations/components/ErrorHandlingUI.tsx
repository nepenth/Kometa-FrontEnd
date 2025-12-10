import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, Chip, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Divider, List, ListItem, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import { Error, Warning, Info, CheckCircle, Refresh, Delete, BugReport, Lightbulb, RestartAlt, SettingsBackupRestore, ContentCopy, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ErrorHandlingUI: React.FC = () => {
  const theme = useTheme();
  const [errors, setErrors] = useState([
    {
      id: 'err-1',
      timestamp: '2024-01-15T10:30:15',
      level: 'warning',
      message: '2 items missing metadata',
      details: 'Items "Movie A" and "Movie B" are missing TMDb metadata. This may affect collection building.',
      operation: 'Library Update',
      affectedItems: ['Movie A', 'Movie B'],
      suggestedActions: [
        'Manually add metadata for affected items',
        'Check TMDb API connectivity',
        'Retry operation with updated metadata'
      ],
      status: 'unresolved',
      canRetry: true,
      canIgnore: true
    },
    {
      id: 'err-2',
      timestamp: '2024-01-15T11:00:25',
      level: 'error',
      message: 'Failed to connect to Plex API',
      details: 'Connection to Plex API timed out after 30 seconds. Please check your network connection and Plex server status.',
      operation: 'Collection Sync',
      affectedItems: [],
      suggestedActions: [
        'Check Plex server status',
        'Verify network connectivity',
        'Check API credentials',
        'Retry operation'
      ],
      status: 'unresolved',
      canRetry: true,
      canIgnore: false
    },
    {
      id: 'err-3',
      timestamp: '2024-01-15T09:45:30',
      level: 'error',
      message: 'Invalid configuration format',
      details: 'The YAML configuration file contains syntax errors. Please validate your configuration before running operations.',
      operation: 'Configuration Load',
      affectedItems: ['config.yml'],
      suggestedActions: [
        'Validate configuration using YAML validator',
        'Check configuration syntax',
        'Review configuration documentation'
      ],
      status: 'resolved',
      canRetry: false,
      canIgnore: false
    }
  ]);

  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const handleRetryError = (errorId: string) => {
    setErrors(errors.map(err =>
      err.id === errorId ? { ...err, status: 'retrying' } : err
    ));

    // Simulate retry
    setTimeout(() => {
      setErrors(errors.map(err => {
        if (err.id === errorId) {
          // Randomly determine if retry succeeds
          const success = Math.random() > 0.3;
          return {
            ...err,
            status: success ? 'resolved' : 'unresolved',
            timestamp: new Date().toISOString()
          };
        }
        return err;
      }));

      setSnackbarMessage('Retry operation completed');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };

  const handleIgnoreError = (errorId: string) => {
    setErrors(errors.map(err =>
      err.id === errorId ? { ...err, status: 'ignored' } : err
    ));
    setSnackbarMessage('Error marked as ignored');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleDeleteError = (errorId: string) => {
    setErrors(errors.filter(err => err.id !== errorId));
    setSnackbarMessage('Error removed');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleCopyErrorDetails = (error: any) => {
    const errorText = `Error: ${error.message}\n\nDetails: ${error.details}\n\nOperation: ${error.operation}\n\nTimestamp: ${error.timestamp}\n\nSuggested Actions:\n- ${error.suggestedActions.join('\n- ')}`;
    navigator.clipboard.writeText(errorText);
    setSnackbarMessage('Error details copied to clipboard');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const getErrorLevelChip = (level: string) => {
    const levelColors: Record<string, any> = {
      error: { color: 'error', label: 'Error' },
      warning: { color: 'warning', label: 'Warning' },
      info: { color: 'info', label: 'Info' }
    };

    return <Chip label={levelColors[level]?.label || level} color={levelColors[level]?.color || 'default'} size="small" />;
  };

  const getStatusChip = (status: string) => {
    const statusColors: Record<string, any> = {
      unresolved: { color: 'error', label: 'Unresolved' },
      resolved: { color: 'success', label: 'Resolved' },
      ignored: { color: 'warning', label: 'Ignored' },
      retrying: { color: 'info', label: 'Retrying' }
    };

    return <Chip label={statusColors[status]?.label || status} color={statusColors[status]?.color || 'default'} size="small" />;
  };

  const filteredErrors = errors.filter(error => {
    const levelMatch = filterLevel === 'all' || error.level === filterLevel;
    const statusMatch = filterStatus === 'all' || error.status === filterStatus;
    const searchMatch = !searchQuery ||
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.operation.toLowerCase().includes(searchQuery.toLowerCase());

    return levelMatch && statusMatch && searchMatch;
  });

  const getErrorStatistics = () => {
    const stats = {
      total: errors.length,
      unresolved: errors.filter(err => err.status === 'unresolved').length,
      resolved: errors.filter(err => err.status === 'resolved').length,
      ignored: errors.filter(err => err.status === 'ignored').length,
      retrying: errors.filter(err => err.status === 'retrying').length,
      errors: errors.filter(err => err.level === 'error').length,
      warnings: errors.filter(err => err.level === 'warning').length,
      info: errors.filter(err => err.level === 'info').length
    };

    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Error Statistics</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${stats.total}`} color="default" size="small" />
          <Chip label={`Unresolved: ${stats.unresolved}`} color="error" size="small" />
          <Chip label={`Resolved: ${stats.resolved}`} color="success" size="small" />
          <Chip label={`Ignored: ${stats.ignored}`} color="warning" size="small" />
          <Chip label={`Retrying: ${stats.retrying}`} color="info" size="small" />
          <Chip label={`Errors: ${stats.errors}`} color="error" size="small" />
          <Chip label={`Warnings: ${stats.warnings}`} color="warning" size="small" />
          <Chip label={`Info: ${stats.info}`} color="info" size="small" />
        </Box>
      </Paper>
    );
  };

  const getErrorDetails = (error: any) => {
    return (
      <Collapse in={expandedError === error.id} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, pl: 4 }}>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Error Details</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {error.details}
          </Typography>

          {error.affectedItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Affected Items</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {error.affectedItems.map((item: string, index: number) => (
                  <Chip key={index} label={item} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom>Suggested Actions</Typography>
          <List dense>
            {error.suggestedActions.map((action: string, index: number) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <Lightbulb color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Error Handling & Recovery
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Error Level</InputLabel>
            <Select
              value={filterLevel}
              onChange={(e: SelectChangeEvent) => setFilterLevel(e.target.value)}
              label="Error Level"
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="error">Errors</MenuItem>
              <MenuItem value="warning">Warnings</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="unresolved">Unresolved</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="ignored">Ignored</MenuItem>
              <MenuItem value="retrying">Retrying</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />
            }}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Statistics */}
      {getErrorStatistics()}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Errors Table */}
      {filteredErrors.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No errors found matching your filters.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredErrors.map((error) => (
                <React.Fragment key={error.id}>
                  <TableRow hover>
                    <TableCell>{getErrorLevelChip(error.level)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{error.message}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{error.operation}</Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(error.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(error.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={expandedError === error.id ? 'Hide details' : 'Show details'}>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
                          >
                            {expandedError === error.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Copy error details">
                          <IconButton size="small" onClick={() => handleCopyErrorDetails(error)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {error.canRetry && (
                          <Tooltip title="Retry operation">
                            <IconButton
                              size="small"
                              onClick={() => handleRetryError(error.id)}
                              color="info"
                              disabled={error.status === 'retrying'}
                            >
                              <RestartAlt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {error.canIgnore && (
                          <Tooltip title="Ignore error">
                            <IconButton
                              size="small"
                              onClick={() => handleIgnoreError(error.id)}
                              color="warning"
                              disabled={error.status !== 'unresolved'}
                            >
                              <SettingsBackupRestore fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Delete error">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteError(error.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {getErrorDetails(error)}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Error Summary */}
      {errors.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Error color="error" />
            <Typography variant="body2">
              {errors.filter(err => err.status === 'unresolved').length} unresolved errors require attention.
            </Typography>
          </Box>
        </Alert>
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

export default ErrorHandlingUI;