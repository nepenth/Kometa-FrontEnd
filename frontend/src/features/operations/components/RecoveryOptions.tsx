import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, Chip, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Divider, List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { SettingsBackupRestore, RestartAlt, Delete, Info, CheckCircle, Error, Warning, Lightbulb, History, Build, ContentCopy, ExpandMore, ExpandLess, Save, Download } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const RecoveryOptions: React.FC = () => {
  const theme = useTheme();
  const [recoveryOptions, setRecoveryOptions] = useState([
    {
      id: 'recovery-1',
      name: 'Configuration Backup',
      description: 'Create a backup of current configuration',
      type: 'backup',
      status: 'available',
      lastUsed: '2024-01-14T09:30:00',
      usageCount: 5,
      successRate: 100
    },
    {
      id: 'recovery-2',
      name: 'Restore from Backup',
      description: 'Restore configuration from previous backup',
      type: 'restore',
      status: 'available',
      lastUsed: '2024-01-10T14:15:00',
      usageCount: 2,
      successRate: 100
    },
    {
      id: 'recovery-3',
      name: 'Reset to Defaults',
      description: 'Reset configuration to factory defaults',
      type: 'reset',
      status: 'available',
      lastUsed: null,
      usageCount: 0,
      successRate: 0
    },
    {
      id: 'recovery-4',
      name: 'Retry Failed Operations',
      description: 'Retry all previously failed operations',
      type: 'retry',
      status: 'available',
      lastUsed: '2024-01-13T11:45:00',
      usageCount: 3,
      successRate: 67
    },
    {
      id: 'recovery-5',
      name: 'System Health Check',
      description: 'Run comprehensive system diagnostics',
      type: 'diagnostic',
      status: 'available',
      lastUsed: '2024-01-12T08:20:00',
      usageCount: 7,
      successRate: 86
    }
  ]);

  const [backupHistory, setBackupHistory] = useState([
    {
      id: 'backup-1',
      timestamp: '2024-01-14T09:30:00',
      name: 'Pre-update backup',
      size: '12.5 KB',
      status: 'success',
      notes: 'Backup created before major configuration update'
    },
    {
      id: 'backup-2',
      timestamp: '2024-01-10T14:15:00',
      name: 'Automatic backup',
      size: '11.8 KB',
      status: 'success',
      notes: 'Scheduled daily backup'
    },
    {
      id: 'backup-3',
      timestamp: '2024-01-08T10:00:00',
      name: 'Manual backup',
      size: '11.2 KB',
      status: 'success',
      notes: 'Backup before testing new features'
    }
  ]);

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'backup' | 'restore' | 'reset' | 'retry' | 'diagnostic' | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const handleExecuteOption = (option: any) => {
    setSelectedOption(option);
    setDialogType(option.type as any);
    setOpenDialog(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setOpenDialog(false);

    // Simulate action execution
    setTimeout(() => {
      setLoading(false);

      // Randomly determine success
      const success = Math.random() > 0.2;

      if (success) {
        setSnackbarMessage(`Successfully executed ${selectedOption.name}`);
        setSnackbarSeverity('success');

        // Update recovery option stats
        setRecoveryOptions(options =>
          options.map(opt =>
            opt.id === selectedOption.id
              ? {
                  ...opt,
                  lastUsed: new Date().toISOString(),
                  usageCount: opt.usageCount + 1,
                  successRate: Math.round(((opt.successRate * opt.usageCount) + 100) / (opt.usageCount + 1))
                }
              : opt
          )
        );

        // Add backup if it's a backup operation
        if (selectedOption.type === 'backup') {
          setBackupHistory([{
            id: `backup-${backupHistory.length + 1}`,
            timestamp: new Date().toISOString(),
            name: `Manual backup - ${new Date().toLocaleDateString()}`,
            size: '12.8 KB',
            status: 'success',
            notes: 'Manual backup created'
          }, ...backupHistory]);
        }
      } else {
        setSnackbarMessage(`Failed to execute ${selectedOption.name}`);
        setSnackbarSeverity('error');
      }

      setSnackbarOpen(true);
      setSelectedOption(null);
    }, 2000);
  };

  const handleRestoreBackup = (backup: any) => {
    setSelectedBackup(backup);
    setDialogType('restore');
    setOpenDialog(true);
  };

  const getOptionIcon = (type: string) => {
    const typeIcons: Record<string, any> = {
      backup: <SettingsBackupRestore color="primary" />,
      restore: <History color="success" />,
      reset: <RestartAlt color="warning" />,
      retry: <RestartAlt color="info" />,
      diagnostic: <Info color="action" />
    };

    return typeIcons[type] || <Build color="action" />;
  };

  const getStatusChip = (status: string) => {
    const statusColors: Record<string, any> = {
      available: { color: 'success', label: 'Available' },
      unavailable: { color: 'error', label: 'Unavailable' },
      success: { color: 'success', label: 'Success' },
      failure: { color: 'error', label: 'Failure' }
    };

    return <Chip label={statusColors[status]?.label || status} color={statusColors[status]?.color || 'default'} size="small" />;
  };

  const getRecoveryOptionsTable = () => {
    return (
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recoveryOptions.map((option) => (
              <React.Fragment key={option.id}>
                <TableRow hover>
                  <TableCell>{getOptionIcon(option.type)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{option.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{option.description}</Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(option.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {option.lastUsed ? new Date(option.lastUsed).toLocaleString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => setExpandedOption(expandedOption === option.id ? null : option.id)}
                        >
                          {expandedOption === option.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Execute">
                        <IconButton
                          size="small"
                          onClick={() => handleExecuteOption(option)}
                          color="primary"
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>

                {expandedOption === option.id && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.action.hover }}>
                        <Typography variant="subtitle2" gutterBottom>Option Details</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Usage Count</Typography>
                            <Typography variant="body1">{option.usageCount}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                            <Typography variant="body1">{option.successRate}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Last Used</Typography>
                            <Typography variant="body1">
                              {option.lastUsed ? new Date(option.lastUsed).toLocaleString() : 'Never'}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Information</Typography>
                        <Typography variant="body2">
                          {option.type === 'backup' && 'Creates a complete backup of your current configuration including all libraries, collections, and settings.'}
                          {option.type === 'restore' && 'Restores configuration from a previous backup. All current settings will be overwritten.'}
                          {option.type === 'reset' && 'Resets all configuration to factory defaults. This cannot be undone.'}
                          {option.type === 'retry' && 'Retries all previously failed operations with the same parameters.'}
                          {option.type === 'diagnostic' && 'Runs comprehensive system diagnostics including API connectivity and configuration validation.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const getBackupHistoryTable = () => {
    return (
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {backupHistory.map((backup) => (
              <TableRow key={backup.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(backup.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{backup.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{backup.size}</Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(backup.status)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Restore from backup">
                      <IconButton
                        size="small"
                        onClick={() => handleRestoreBackup(backup)}
                        color="success"
                      >
                        <History fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Download backup">
                      <IconButton size="small" color="info">
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete backup">
                      <IconButton size="small" color="error">
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
    );
  };

  const getRecoveryStatistics = () => {
    const stats = {
      totalOptions: recoveryOptions.length,
      totalBackups: backupHistory.length,
      lastBackup: backupHistory.length > 0 ? backupHistory[0].timestamp : null,
      averageSuccessRate: Math.round(recoveryOptions.reduce((sum, opt) => sum + opt.successRate, 0) / recoveryOptions.length)
    };

    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Recovery Statistics</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Recovery Options: ${stats.totalOptions}`} color="default" size="small" />
          <Chip label={`Backups: ${stats.totalBackups}`} color="success" size="small" />
          <Chip
            label={`Last Backup: ${stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'None'}`}
            color={stats.lastBackup ? 'success' : 'error'}
            size="small"
          />
          <Chip label={`Avg Success Rate: ${stats.averageSuccessRate}%`} color="info" size="small" />
        </Box>
      </Paper>
    );
  };

  const getConfirmationDialog = () => {
    if (!selectedOption || !dialogType) return null;

    const dialogContent: Record<string, any> = {
      backup: {
        title: 'Create Configuration Backup',
        message: 'Are you sure you want to create a backup of your current configuration?',
        confirmText: 'Create Backup',
        icon: <SettingsBackupRestore color="primary" sx={{ fontSize: 48 }} />
      },
      restore: {
        title: selectedBackup ? 'Restore from Backup' : 'Restore Configuration',
        message: selectedBackup
          ? `Are you sure you want to restore from "${selectedBackup.name}"? This will overwrite your current configuration.`
          : 'Are you sure you want to restore configuration? This will overwrite your current settings.',
        confirmText: 'Restore',
        icon: <History color="success" sx={{ fontSize: 48 }} />
      },
      reset: {
        title: 'Reset to Factory Defaults',
        message: 'Are you sure you want to reset all configuration to factory defaults? This action cannot be undone.',
        confirmText: 'Reset Configuration',
        icon: <RestartAlt color="warning" sx={{ fontSize: 48 }} />
      },
      retry: {
        title: 'Retry Failed Operations',
        message: 'Are you sure you want to retry all previously failed operations?',
        confirmText: 'Retry Operations',
        icon: <RestartAlt color="info" sx={{ fontSize: 48 }} />
      },
      diagnostic: {
        title: 'Run System Diagnostics',
        message: 'Are you sure you want to run comprehensive system diagnostics? This may take several minutes.',
        confirmText: 'Run Diagnostics',
        icon: <Info color="action" sx={{ fontSize: 48 }} />
      }
    };

    return (
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {dialogContent[dialogType].icon}
          <Typography variant="h6">{dialogContent[dialogType].title}</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body1" gutterBottom>
            {dialogContent[dialogType].message}
          </Typography>

          {dialogType === 'restore' && selectedBackup && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Backup Details</Typography>
              <Typography variant="body2">Name: {selectedBackup.name}</Typography>
              <Typography variant="body2">Timestamp: {new Date(selectedBackup.timestamp).toLocaleString()}</Typography>
              <Typography variant="body2">Size: {selectedBackup.size}</Typography>
              <Typography variant="body2">Status: {selectedBackup.status}</Typography>
            </Box>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {dialogType === 'reset' && 'This action cannot be undone. All custom configuration will be lost.'}
              {dialogType === 'restore' && 'This will overwrite your current configuration. Make sure you have a backup.'}
              {dialogType === 'backup' && 'Backup will include all libraries, collections, and settings.'}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={
              dialogType === 'backup' ? <SettingsBackupRestore /> :
              dialogType === 'restore' ? <History /> :
              dialogType === 'reset' ? <RestartAlt /> :
              dialogType === 'retry' ? <RestartAlt /> : <Info />
            }
            onClick={handleConfirmAction}
            disabled={loading}
            color={
              dialogType === 'backup' ? 'primary' :
              dialogType === 'restore' ? 'success' :
              dialogType === 'reset' ? 'warning' :
              dialogType === 'retry' ? 'info' : 'primary'
            }
          >
            {dialogContent[dialogType].confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Recovery Options & System Tools
      </Typography>

      {/* Statistics */}
      {getRecoveryStatistics()}

      {/* Recovery Options */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recovery Options</Typography>
        {getRecoveryOptionsTable()}
      </Box>

      {/* Backup History */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Backup History</Typography>
        {getBackupHistoryTable()}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Confirmation Dialog */}
      {getConfirmationDialog()}

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

export default RecoveryOptions;