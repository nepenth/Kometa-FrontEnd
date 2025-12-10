import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, IconButton, Tooltip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Divider } from '@mui/material';
import { PlayArrow, Stop, Refresh, Delete, Info, CheckCircle, Error, Warning, Timeline, Schedule, History, BarChart, PieChart, ShowChart } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProgressTracking: React.FC = () => {
  const theme = useTheme();
  const [operations, setOperations] = useState([
    {
      id: 'op-1',
      name: 'Library Update',
      type: 'library',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15T10:30:00',
      endTime: '2024-01-15T10:35:00',
      duration: '5 minutes',
      itemsProcessed: 42,
      itemsTotal: 42,
      errors: 0,
      warnings: 2,
      steps: [
        { name: 'Initialization', status: 'completed', duration: '1 minute' },
        { name: 'Metadata Fetching', status: 'completed', duration: '2 minutes' },
        { name: 'Collection Building', status: 'completed', duration: '1 minute' },
        { name: 'Finalization', status: 'completed', duration: '1 minute' }
      ]
    },
    {
      id: 'op-2',
      name: 'Collection Sync',
      type: 'collection',
      status: 'running',
      progress: 65,
      startTime: '2024-01-15T11:00:00',
      endTime: null,
      duration: '10 minutes',
      itemsProcessed: 187,
      itemsTotal: 287,
      errors: 0,
      warnings: 0,
      steps: [
        { name: 'Initialization', status: 'completed', duration: '1 minute' },
        { name: 'Item Processing', status: 'running', duration: '8 minutes' },
        { name: 'Validation', status: 'pending', duration: '0 minutes' },
        { name: 'Finalization', status: 'pending', duration: '0 minutes' }
      ]
    },
    {
      id: 'op-3',
      name: 'Metadata Refresh',
      type: 'metadata',
      status: 'queued',
      progress: 0,
      startTime: null,
      endTime: null,
      duration: '0 minutes',
      itemsProcessed: 0,
      itemsTotal: 150,
      errors: 0,
      warnings: 0,
      steps: [
        { name: 'Initialization', status: 'pending', duration: '0 minutes' },
        { name: 'Metadata Fetching', status: 'pending', duration: '0 minutes' },
        { name: 'Processing', status: 'pending', duration: '0 minutes' },
        { name: 'Finalization', status: 'pending', duration: '0 minutes' }
      ]
    }
  ]);

  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    // Simulate loading operations
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleStartOperation = (operationId: string) => {
    setOperations(operations.map(op =>
      op.id === operationId ? { ...op, status: 'running', progress: 0 } : op
    ));

    // Simulate operation progress
    const interval = setInterval(() => {
      setOperations(prevOps =>
        prevOps.map(op => {
          if (op.id === operationId && op.status === 'running') {
            const newProgress = Math.min(op.progress + 5, 100);
            const newItemsProcessed = Math.min(
              op.itemsProcessed + Math.floor(op.itemsTotal * 0.05),
              op.itemsTotal
            );

            if (newProgress >= 100) {
              clearInterval(interval);
              return {
                ...op,
                status: 'completed',
                progress: 100,
                itemsProcessed: op.itemsTotal,
                endTime: new Date().toISOString(),
                duration: '15 minutes',
                steps: op.steps.map(step => ({ ...step, status: 'completed' }))
              };
            }

            // Update step statuses based on progress
            const updatedSteps = [...op.steps];
            if (newProgress >= 25 && updatedSteps[0].status !== 'completed') {
              updatedSteps[0] = { ...updatedSteps[0], status: 'completed' };
            }
            if (newProgress >= 50 && updatedSteps[1].status !== 'completed') {
              updatedSteps[1] = { ...updatedSteps[1], status: 'completed' };
            }
            if (newProgress >= 75 && updatedSteps[2].status !== 'completed') {
              updatedSteps[2] = { ...updatedSteps[2], status: 'completed' };
            }
            if (newProgress >= 90 && updatedSteps[3].status !== 'completed') {
              updatedSteps[3] = { ...updatedSteps[3], status: 'completed' };
            }

            return {
              ...op,
              progress: newProgress,
              itemsProcessed: newItemsProcessed,
              steps: updatedSteps
            };
          }
          return op;
        })
      );
    }, 500);

    setSnackbarMessage('Operation started successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleStopOperation = (operationId: string) => {
    setOperations(operations.map(op =>
      op.id === operationId ? { ...op, status: 'stopped' } : op
    ));
    setSnackbarMessage('Operation stopped');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(operations.filter(op => op.id !== operationId));
    setSnackbarMessage('Operation removed');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleViewDetails = (operation: any) => {
    setSelectedOperation(operation);
  };

  const handleRefresh = () => {
    setLoading(true);
    setSnackbarMessage('Refreshing operation status...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage('Operation status refreshed');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 1500);
  };

  const getStatusChip = (status: string) => {
    const statusColors: Record<string, any> = {
      completed: { color: 'success', label: 'Completed' },
      running: { color: 'info', label: 'Running' },
      queued: { color: 'warning', label: 'Queued' },
      stopped: { color: 'error', label: 'Stopped' },
      failed: { color: 'error', label: 'Failed' }
    };

    return <Chip label={statusColors[status]?.label || status} color={statusColors[status]?.color || 'default'} size="small" />;
  };

  const getTypeIcon = (type: string) => {
    const typeIcons: Record<string, any> = {
      library: <Info color="primary" />,
      collection: <CheckCircle color="success" />,
      metadata: <Settings color="action" />,
      overlay: <ContentCopy color="secondary" />,
      playlist: <History color="warning" />
    };

    return typeIcons[type] || <Description color="action" />;
  };

  const filteredOperations = operations.filter(op => {
    const statusMatch = filterStatus === 'all' || op.status === filterStatus;
    const typeMatch = filterType === 'all' || op.type === filterType;
    return statusMatch && typeMatch;
  });

  const getOperationStatistics = () => {
    const stats = {
      total: operations.length,
      completed: operations.filter(op => op.status === 'completed').length,
      running: operations.filter(op => op.status === 'running').length,
      queued: operations.filter(op => op.status === 'queued').length,
      failed: operations.filter(op => op.status === 'failed').length,
      totalItems: operations.reduce((sum, op) => sum + op.itemsProcessed, 0),
      totalItemsPlanned: operations.reduce((sum, op) => sum + op.itemsTotal, 0),
      totalErrors: operations.reduce((sum, op) => sum + op.errors, 0),
      totalWarnings: operations.reduce((sum, op) => sum + op.warnings, 0),
      overallProgress: operations.length > 0 ?
        Math.round(operations.reduce((sum, op) => sum + op.progress, 0) / operations.length) : 0
    };

    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Operation Statistics</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${stats.total}`} color="default" size="small" />
          <Chip label={`Completed: ${stats.completed}`} color="success" size="small" />
          <Chip label={`Running: ${stats.running}`} color="info" size="small" />
          <Chip label={`Queued: ${stats.queued}`} color="warning" size="small" />
          <Chip label={`Failed: ${stats.failed}`} color="error" size="small" />
          <Chip label={`Progress: ${stats.overallProgress}%`} color="primary" size="small" />
          <Chip label={`Items: ${stats.totalItems}/${stats.totalItemsPlanned}`} color="default" size="small" />
          <Chip label={`Errors: ${stats.totalErrors}`} color="error" size="small" />
          <Chip label={`Warnings: ${stats.totalWarnings}`} color="warning" size="small" />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Overall Progress</Typography>
          <LinearProgress
            variant="determinate"
            value={stats.overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.divider
            }}
          />
          <Typography variant="caption" display="block" textAlign="right" sx={{ mt: 0.5 }}>
            {stats.overallProgress}%
          </Typography>
        </Box>
      </Paper>
    );
  };

  const getOperationProgressBar = (operation: any) => {
    const progressColor =
      operation.status === 'completed' ? theme.palette.success.main :
      operation.status === 'running' ? theme.palette.info.main :
      operation.status === 'failed' ? theme.palette.error.main :
      theme.palette.warning.main;

    return (
      <Box sx={{ width: '100%', mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={operation.progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.divider,
            '& .MuiLinearProgress-bar': {
              backgroundColor: progressColor
            }
          }}
        />
        <Typography variant="caption" display="block" textAlign="right" sx={{ mt: 0.5 }}>
          {operation.progress}% ({operation.itemsProcessed}/{operation.itemsTotal} items)
        </Typography>
      </Box>
    );
  };

  const getStepTimeline = (steps: any[]) => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Step-by-Step Progress</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {steps.map((step, index) => {
            const stepColor =
              step.status === 'completed' ? theme.palette.success.main :
              step.status === 'running' ? theme.palette.info.main :
              theme.palette.divider;

            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${stepColor}`,
                  backgroundColor: step.status === 'completed' ? stepColor : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.status === 'completed' ? theme.palette.success.contrastText : stepColor,
                  fontSize: '0.75rem'
                }}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{step.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.status} • {step.duration}
                  </Typography>
                </Box>
                {getStatusChip(step.status)}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const getOperationDetails = () => {
    if (!selectedOperation) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>Operation Details</Typography>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1">{selectedOperation.name}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography variant="body1">{selectedOperation.type}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Typography variant="body1">{selectedOperation.status}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Progress</Typography>
              <Typography variant="body1">{selectedOperation.progress}%</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Items Processed</Typography>
              <Typography variant="body1">
                {selectedOperation.itemsProcessed}/{selectedOperation.itemsTotal}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Errors</Typography>
              <Typography variant="body1">{selectedOperation.errors}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Warnings</Typography>
              <Typography variant="body1">{selectedOperation.warnings}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Start Time</Typography>
              <Typography variant="body1">
                {selectedOperation.startTime ? new Date(selectedOperation.startTime).toLocaleString() : 'Not started'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">End Time</Typography>
              <Typography variant="body1">
                {selectedOperation.endTime ? new Date(selectedOperation.endTime).toLocaleString() : 'Not completed'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body1">{selectedOperation.duration}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {getOperationProgressBar(selectedOperation)}
          {getStepTimeline(selectedOperation.steps)}
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Progress Tracking
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="queued">Queued</MenuItem>
              <MenuItem value="stopped">Stopped</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="library">Library</MenuItem>
              <MenuItem value="collection">Collection</MenuItem>
              <MenuItem value="metadata">Metadata</MenuItem>
              <MenuItem value="overlay">Overlay</MenuItem>
              <MenuItem value="playlist">Playlist</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Statistics */}
      {getOperationStatistics()}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Operations Table */}
      {filteredOperations.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No operations found matching your filters.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOperations.map((operation) => (
                <TableRow key={operation.id} hover>
                  <TableCell>{getTypeIcon(operation.type)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{operation.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(operation.status)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{operation.progress}%</Typography>
                      <Box sx={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: theme.palette.divider,
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: `${operation.progress}%`,
                          height: '100%',
                          backgroundColor:
                            operation.status === 'completed' ? theme.palette.success.main :
                            operation.status === 'running' ? theme.palette.info.main :
                            operation.status === 'failed' ? theme.palette.error.main :
                            theme.palette.warning.main
                        }} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {operation.itemsProcessed}/{operation.itemsTotal}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{operation.duration}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => handleViewDetails(operation)}>
                          <Timeline fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {operation.status === 'queued' && (
                        <Tooltip title="Start operation">
                          <IconButton
                            size="small"
                            onClick={() => handleStartOperation(operation.id)}
                            color="success"
                          >
                            <PlayArrow fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {operation.status === 'running' && (
                        <Tooltip title="Stop operation">
                          <IconButton
                            size="small"
                            onClick={() => handleStopOperation(operation.id)}
                            color="error"
                          >
                            <Stop fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete operation">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOperation(operation.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Operation Details */}
      {selectedOperation && getOperationDetails()}

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

export default ProgressTracking;