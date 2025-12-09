import React, { useEffect, useMemo, useRef, useState } from 'react';

import { DeleteSweep, Download, Pause, PlayArrow, Search } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { apiService } from '../services/api';
import { logWebSocket } from '../services/websocket';

const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('ALL');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch historical logs
    const fetchHistory = async () => {
      try {
        const response = await apiService.get('/logs/history?lines=1000');
        if (response.data && response.data.lines) {
          setLogs(response.data.lines.map((l: string) => l.trimEnd()));
        }
      } catch (error) {
        console.error('Failed to fetch log history', error);
      }
    };
    fetchHistory();

    logWebSocket.connect();

    const handleLogMessage = (message: string) => {
      if (!isPaused) {
        setLogs((prevLogs) => {
          const newLogs = [...prevLogs, message];
          if (newLogs.length > 2000) {
            return newLogs.slice(newLogs.length - 2000);
          }
          return newLogs;
        });
      }
    };

    logWebSocket.addListener(handleLogMessage);

    return () => {
      logWebSocket.removeListener(handleLogMessage);
      logWebSocket.disconnect();
    };
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, searchTerm, logLevel]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDownloadLogs = () => {
    const element = document.createElement('a');
    const file = new Blob([logs.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'kometa-logs.txt';
    document.body.appendChild(element);
    element.click();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = logLevel === 'ALL' || log.includes(logLevel);
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, logLevel]);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">System Logs</Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'flex-end',
          }}
        >
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select value={logLevel} label="Level" onChange={(e) => setLogLevel(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="DEBUG">Debug</MenuItem>
            </Select>
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              pl: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              }
              label="Auto-scroll"
            />
            <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
              <IconButton
                onClick={() => setIsPaused(!isPaused)}
                color={isPaused ? 'warning' : 'default'}
              >
                {isPaused ? <PlayArrow /> : <Pause />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Logs">
              <IconButton onClick={handleClearLogs}>
                <DeleteSweep />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Logs">
              <IconButton onClick={handleDownloadLogs}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Paper
        sx={{
          flexGrow: 1,
          p: 2,
          bgcolor: '#0f172a',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '0.875rem',
          overflowY: 'auto',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          '&::-webkit-scrollbar': { width: '10px' },
          '&::-webkit-scrollbar-track': { background: '#1e293b' },
          '&::-webkit-scrollbar-thumb': { background: '#475569', borderRadius: '5px' },
        }}
      >
        {filteredLogs.length === 0 && (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {logs.length === 0 ? 'Waiting for logs...' : 'No logs match your filter.'}
          </Typography>
        )}
        {filteredLogs.map((log, index) => (
          <Box
            key={index}
            sx={{
              mb: 0.5,
              color: log.includes('ERROR')
                ? '#ef4444'
                : log.includes('WARNING')
                  ? '#f59e0b'
                  : log.includes('DEBUG')
                    ? '#64748b'
                    : '#94a3b8',
            }}
          >
            {log}
          </Box>
        ))}
        <div ref={logsEndRef} />
      </Paper>
    </Box>
  );
};

export default LogsViewer;
