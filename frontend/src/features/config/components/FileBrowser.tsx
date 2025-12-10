import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { fetchConfigFiles, fetchFileContent, validateReference } from '../configSlice';
import { Box, Typography, Button, CircularProgress, Alert, Chip, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Breadcrumbs, Link } from '@mui/material';
import { Folder, Description, CheckCircle, Error, Warning, Refresh, FileOpen, ContentCopy, Edit, Delete, Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const FileBrowser: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { files, fileContent, validation, loading, error } = useSelector((state: RootState) => state.config);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [referenceToValidate, setReferenceToValidate] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState('config/');

  useEffect(() => {
    dispatch(fetchConfigFiles());
  }, [dispatch]);

  const handleFileSelect = async (file: any) => {
    setSelectedFile(file);
    try {
      await dispatch(fetchFileContent(file.full_path) as any);
      setOpenDialog(true);
    } catch (err) {
      console.error('Failed to load file content:', err);
    }
  };

  const handleValidateReference = async () => {
    if (!referenceToValidate.trim()) return;

    try {
      const result = await dispatch(validateReference(referenceToValidate) as any);
      setValidationResult(result.payload);
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  const getFileIcon = (file: any) => {
    if (file.type === 'directory') {
      return <Folder color="primary" />;
    } else if (file.type === 'yaml' || file.type === 'yml') {
      return <Description color="secondary" />;
    } else {
      return <Description color="action" />;
    }
  };

  const getFileStatus = (file: any) => {
    if (!fileContent) return null;

    if (fileContent.data.path === file.full_path) {
      if (fileContent.data.type === 'file') {
        return <Chip label="Loaded" size="small" color="success" />;
      }
    }

    return null;
  };

  const renderFileTable = (fileList: any[], title: string) => {
    if (!fileList || fileList.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {title} ({fileList.length})
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Path</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileList.map((file, index) => (
                <TableRow key={index} hover>
                  <TableCell>{getFileIcon(file)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{file.path.split('/').pop()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      {file.path}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getFileStatus(file)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View content">
                      <IconButton size="small" onClick={() => handleFileSelect(file)}>
                        <FileOpen fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy path">
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(file.full_path)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderFileContentDialog = () => {
    if (!selectedFile || !fileContent) return null;

    return (
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedFile.path}</Typography>
            <Box>
              {fileContent.data.type === 'file' && (
                <Chip
                  label={fileContent.data.type}
                  color="success"
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {fileContent.data.resolved_path && (
                <Chip
                  label="Resolved"
                  color="info"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>File Information</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="caption">Type: {fileContent.data.type}</Typography>
              <Typography variant="caption">Path: {fileContent.data.path}</Typography>
              {fileContent.data.resolved_path && (
                <Typography variant="caption">Resolved: {fileContent.data.resolved_path}</Typography>
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>Content</Typography>
          <Paper variant="outlined" sx={{ p: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {fileContent.data.content}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={() => navigator.clipboard.writeText(fileContent.data.content)}
          >
            Copy Content
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderReferenceValidator = () => {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Reference Validator</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Validate file references (e.g., "default: Basic", "file: /path/to/file.yml")
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter reference to validate (e.g., default: Basic)"
            value={referenceToValidate}
            onChange={(e) => setReferenceToValidate(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleValidateReference}
            disabled={loading || !referenceToValidate.trim()}
          >
            Validate
          </Button>
        </Box>

        {validationResult && (
          <Alert
            severity={
              validationResult.data.valid ? 'success' :
              validationResult.data.errors.length > 0 ? 'error' : 'warning'
            }
            sx={{ mt: 2 }}
          >
            {validationResult.data.valid ? (
              <Typography variant="body2">Reference is valid</Typography>
            ) : (
              <Box>
                <Typography variant="body2">Reference validation failed</Typography>
                {validationResult.data.errors.map((error: string, index: number) => (
                  <Typography key={index} variant="caption" color="error">- {error}</Typography>
                ))}
                {validationResult.data.warnings.map((warning: string, index: number) => (
                  <Typography key={index} variant="caption" color="warning">- {warning}</Typography>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </Paper>
    );
  };

  if (loading && !files) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button
          variant="text"
          size="small"
          onClick={() => dispatch(fetchConfigFiles())}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Configuration File Browser
      </Typography>

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link color="inherit" href="#" onClick={() => setCurrentPath('config/')}>
          Configuration Files
        </Link>
        {currentPath !== 'config/' && (
          <Typography color="text.primary">{currentPath}</Typography>
        )}
      </Breadcrumbs>

      {/* Reference Validator */}
      {renderReferenceValidator()}

      {/* File Tables */}
      {renderFileTable(files?.config_files || [], 'Configuration Files')}
      {renderFileTable(files?.defaults_files || [], 'Defaults Files')}

      {/* File Content Dialog */}
      {renderFileContentDialog()}

      {/* Summary */}
      {files && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Total files found: {files.total_files} (
            {files.config_files.length} config files, {files.defaults_files.length} defaults files)
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FileBrowser;