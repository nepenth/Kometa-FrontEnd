import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, IconButton, Tooltip, TextField, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Divider } from '@mui/material';
import { PlayArrow, Stop, Refresh, Delete, Info, CheckCircle, Error, Warning, Search, FilterList, ContentCopy, Download, Clear } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const RealTimeLogViewer: React.FC = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<string[]>([
    '[2024-01-15 10:30:00] [INFO] Starting library update operation',
    '[2024-01-15 10:30:05] [INFO] Processing library: Movies',
    '[2024-01-15 10:30:10] [INFO] Found 42 items to process',
    '[2024-01-15 10:30:15] [WARNING] 2 items missing metadata',
    '[2024-01-15 10:30:20] [INFO] Processing collections...',
    '[2024-01-15 10:30:25] [INFO] Collection "Action Movies" created',
    '[2024-01-15 10:30:30] [INFO] Collection "Sci-Fi Movies" created',
    '[2024-01-15 10:30:35] [INFO] Operation completed successfully',
    '[2024-01-15 11:00:00] [INFO] Starting collection sync operation',
    '[2024-01-15 11:00:05] [INFO] Processing 187 items...',
    '[2024-01-15 11:00:10] [INFO] 65% complete',
    '[2024-01-15 11:00:15] [INFO] Collection sync in progress...'
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [logLevelCounts, setLogLevelCounts] = useState({
    info: 0,
    warning: 0,
    error: 0,
    debug: 0
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Count log levels
    const counts = { info: 0, warning: 0, error: 0, debug: 0 };
    logs.forEach(log => {
      if (log.includes('[INFO]')) counts.info++;
      else if (log.includes('[WARNING]')) counts.warning++;
      else if (log.includes('[ERROR]')) counts.error++;
      else if (log.includes('[DEBUG]')) counts.debug++;
    });
    setLogLevelCounts(counts);
  }, [logs]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleStartStreaming = () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setSnackbarMessage('Log streaming started');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);

    // Simulate real-time log streaming
    const logTypes = [
      '[INFO] Processing item...',
      '[INFO] Collection updated',
      '[WARNING] Missing metadata for item',
      '[INFO] Operation progress: 25%',
      '[INFO] Operation progress: 50%',
      '[INFO] Operation progress: 75%',
      '[INFO] Operation completed',
      '[ERROR] Failed to process item',
      '[DEBUG] Detailed processing information'
    ];

    const interval = setInterval(() => {
      const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${randomLog}`]);
    }, 2000);

    // Stop after 30 seconds for demo
    setTimeout(() => {
      clearInterval(interval);
      setIsStreaming(false);
      setSnackbarMessage('Log streaming stopped');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }, 30000);

    return () => clearInterval(interval);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    setSnackbarMessage('Log streaming stopped');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSnackbarMessage('Logs cleared');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleDownloadLogs = () => {
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kometa-logs-${new Date().toISOString().substring(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSnackbarMessage('Logs downloaded');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setSnackbarMessage('Logs copied to clipboard');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const getLogLevelChip = (level: string) => {
    const levelColors: Record<string, any> = {
      INFO: { color: 'info', label: 'Info' },
      WARNING: { color: 'warning', label: 'Warning' },
      ERROR: { color: 'error', label: 'Error' },
      DEBUG: { color: 'default', label: 'Debug' }
    };

    return <Chip label={levelColors[level]?.label || level} color={levelColors[level]?.color || 'default'} size="small" />;
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <Info color="info" fontSize="small" />;
      case 'WARNING': return <Warning color="warning" fontSize="small" />;
      case 'ERROR': return <Error color="error" fontSize="small" />;
      case 'DEBUG': return <CheckCircle color="action" fontSize="small" />;
      default: return <Info color="action" fontSize="small" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filterLevel !== 'all') {
      const levelMatch = filterLevel === 'info' && log.includes('[INFO]') ||
                        filterLevel === 'warning' && log.includes('[WARNING]') ||
                        filterLevel === 'error' && log.includes('[ERROR]') ||
                        filterLevel === 'debug' && log.includes('[DEBUG]');
      if (!levelMatch) return false;
    }

    // Filter by search query
    if (searchQuery && !log.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getLogStatistics = () => {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Log Statistics</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${logs.length}`} color="default" size="small" />
          <Chip label={`Info: ${logLevelCounts.info}`} color="info" size="small" />
          <Chip label={`Warnings: ${logLevelCounts.warning}`} color="warning" size="small" />
          <Chip label={`Errors: ${logLevelCounts.error}`} color="error" size="small" />
          <Chip label={`Debug: ${logLevelCounts.debug}`} color="default" size="small" />
          <Chip label={`Filtered: ${filteredLogs.length}`} color="primary" size="small" />
        </Box>
      </Paper>
    );
  };

  const getLogEntry = (log: string, index: number) => {
    const timestampMatch = log.match(/^\[([^\]]+)\]/);
    const levelMatch = log.match(/\[(INFO|WARNING|ERROR|DEBUG)\]/);
    const message = log.replace(/^\[[^\]]+\] \[[^\]]+\] /, '');

    const timestamp = timestampMatch ? timestampMatch[1] : '';
    const level = levelMatch ? levelMatch[1] : 'INFO';

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          py: 1,
          borderBottom: index < filteredLogs.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        {showTimestamps && (
          <Box sx={{ minWidth: '180px' }}>
            <Typography variant="caption" color="text.secondary">{timestamp}</Typography>
          </Box>
        )}
        <Box sx={{ minWidth: '80px' }}>
          {getLogLevelIcon(level)}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">{message}</Typography>
        </Box>
        <Box>
          {getLogLevelChip(level)}
        </Box>
      </Box>
    );
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Real-Time Log Viewer
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant={isStreaming ? 'outlined' : 'contained'}
            startIcon={isStreaming ? <Stop /> : <PlayArrow />}
            onClick={isStreaming ? handleStopStreaming : handleStartStreaming}
            disabled={isStreaming}
            color={isStreaming ? 'error' : 'primary'}
          >
            {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            Clear Logs
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
          >
            Download Logs
          </Button>

          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
          >
            Copy Logs
          </Button>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Level</InputLabel>
            <Select
              value={filterLevel}
              onChange={(e: SelectChangeEvent) => setFilterLevel(e.target.value)}
              label="Filter Level"
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warnings</MenuItem>
              <MenuItem value="error">Errors</MenuItem>
              <MenuItem value="debug">Debug</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />
            }}
          />

          <Tooltip title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}>
            <IconButton
              onClick={() => setAutoScroll(!autoScroll)}
              color={autoScroll ? 'primary' : 'default'}
            >
              <FilterList />
            </IconButton>
          </Tooltip>

          <Tooltip title={showTimestamps ? 'Hide timestamps' : 'Show timestamps'}>
            <IconButton
              onClick={() => setShowTimestamps(!showTimestamps)}
              color={showTimestamps ? 'primary' : 'default'}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Statistics */}
      {getLogStatistics()}

      {/* Log Container */}
      <Paper variant="outlined" sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box
          ref={logContainerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            backgroundColor: theme.palette.background.paper
          }}
        >
          {filteredLogs.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                {logs.length === 0 ? 'No logs available' : 'No logs match your filters'}
              </Typography>
            </Box>
          ) : (
            filteredLogs.map((log, index) => getLogEntry(log, index))
          )}
        </Box>
      </Paper>

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

export default RealTimeLogViewer;