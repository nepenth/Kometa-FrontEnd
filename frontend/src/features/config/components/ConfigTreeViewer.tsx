import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { fetchConfigStructure } from '../configSlice';
import { TreeView, TreeItem } from '@mui/lab';
import { Box, Typography, CircularProgress, Alert, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ExpandMore, ChevronRight, Folder, Description, Info, Error, Warning } from '@mui/icons-material';

const ConfigTreeViewer: React.FC = () => {
  const dispatch = useDispatch();
  const { structure, loading, error } = useSelector((state: RootState) => state.config);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchConfigStructure());
  }, [dispatch]);

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    event.preventDefault();
    if (nodeId === 'root') return;

    // Parse the nodeId to get the structure path
    const pathParts = nodeId.split('-');
    let currentNode = structure?.data;

    if (pathParts[0] === 'libraries' && pathParts.length >= 2) {
      const libName = pathParts[1];
      currentNode = currentNode?.libraries[libName];

      if (pathParts.length >= 3) {
        const section = pathParts[2];
        if (section === 'collection_files' && pathParts.length >= 4) {
          const fileIndex = parseInt(pathParts[3]);
          currentNode = currentNode?.collection_files[fileIndex];
        } else if (section === 'overlay_files' && pathParts.length >= 4) {
          const fileIndex = parseInt(pathParts[3]);
          currentNode = currentNode?.overlay_files[fileIndex];
        } else if (section === 'metadata_files' && pathParts.length >= 4) {
          const fileIndex = parseInt(pathParts[3]);
          currentNode = currentNode?.metadata_files[fileIndex];
        } else {
          currentNode = currentNode?.[section];
        }
      }
    } else if (pathParts[0] === 'playlists') {
      currentNode = currentNode?.playlists;
    } else if (pathParts[0] === 'settings') {
      currentNode = currentNode?.settings;
    }

    setSelectedNode(currentNode);
    setOpenDialog(true);
  };

  const renderTreeItems = () => {
    if (!structure?.data) return null;

    const { libraries, playlists, settings } = structure.data;

    return (
      <>
        {Object.keys(libraries).length > 0 && (
          <TreeItem
            nodeId="libraries"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Folder color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">Libraries ({Object.keys(libraries).length})</Typography>
              </Box>
            }
          >
            {Object.entries(libraries).map(([libName, libData]) => (
              <TreeItem
                key={`libraries-${libName}`}
                nodeId={`libraries-${libName}`}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Folder color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2">{libName}</Typography>
                  </Box>
                }
              >
                {/* Collection Files */}
                {libData.collection_files.length > 0 && (
                  <TreeItem
                    nodeId={`libraries-${libName}-collection_files`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description color="info" sx={{ mr: 1 }} />
                        <Typography variant="caption">Collection Files ({libData.collection_files.length})</Typography>
                      </Box>
                    }
                  >
                    {libData.collection_files.map((file, index) => (
                      <TreeItem
                        key={`libraries-${libName}-collection_files-${index}`}
                        nodeId={`libraries-${libName}-collection_files-${index}`}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {file.exists ? (
                              <Description color="success" sx={{ mr: 1, fontSize: 'small' }} />
                            ) : (
                              <Error color="error" sx={{ mr: 1, fontSize: 'small' }} />
                            )}
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              {file.reference}
                              {file.asset_directory && ` (${file.asset_directory})`}
                            </Typography>
                            {!file.exists && (
                              <Chip label="Missing" size="small" color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </TreeItem>
                )}

                {/* Overlay Files */}
                {libData.overlay_files.length > 0 && (
                  <TreeItem
                    nodeId={`libraries-${libName}-overlay_files`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description color="warning" sx={{ mr: 1 }} />
                        <Typography variant="caption">Overlay Files ({libData.overlay_files.length})</Typography>
                      </Box>
                    }
                  >
                    {libData.overlay_files.map((file, index) => (
                      <TreeItem
                        key={`libraries-${libName}-overlay_files-${index}`}
                        nodeId={`libraries-${libName}-overlay_files-${index}`}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {file.exists ? (
                              <Description color="success" sx={{ mr: 1, fontSize: 'small' }} />
                            ) : (
                              <Error color="error" sx={{ mr: 1, fontSize: 'small' }} />
                            )}
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              {file.reference}
                            </Typography>
                            {!file.exists && (
                              <Chip label="Missing" size="small" color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </TreeItem>
                )}

                {/* Metadata Files */}
                {libData.metadata_files.length > 0 && (
                  <TreeItem
                    nodeId={`libraries-${libName}-metadata_files`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description color="success" sx={{ mr: 1 }} />
                        <Typography variant="caption">Metadata Files ({libData.metadata_files.length})</Typography>
                      </Box>
                    }
                  >
                    {libData.metadata_files.map((file, index) => (
                      <TreeItem
                        key={`libraries-${libName}-metadata_files-${index}`}
                        nodeId={`libraries-${libName}-metadata_files-${index}`}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {file.exists ? (
                              <Description color="success" sx={{ mr: 1, fontSize: 'small' }} />
                            ) : (
                              <Error color="error" sx={{ mr: 1, fontSize: 'small' }} />
                            )}
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              {file.reference}
                            </Typography>
                            {!file.exists && (
                              <Chip label="Missing" size="small" color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </TreeItem>
                )}

                {/* Library Settings */}
                {Object.keys(libData.settings).length > 0 && (
                  <TreeItem
                    nodeId={`libraries-${libName}-settings`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption">Settings</Typography>
                      </Box>
                    }
                  >
                    {Object.entries(libData.settings).map(([settingKey, settingValue]) => (
                      <TreeItem
                        key={`libraries-${libName}-settings-${settingKey}`}
                        nodeId={`libraries-${libName}-settings-${settingKey}`}
                        label={
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {settingKey}: {typeof settingValue === 'object' ? JSON.stringify(settingValue) : String(settingValue)}
                          </Typography>
                        }
                      />
                    ))}
                  </TreeItem>
                )}
              </TreeItem>
            ))}
          </TreeItem>
        )}

        {/* Playlists */}
        {playlists && playlists.length > 0 && (
          <TreeItem
            nodeId="playlists"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Folder color="warning" sx={{ mr: 1 }} />
                <Typography variant="body1">Playlists ({playlists.length})</Typography>
              </Box>
            }
          >
            {playlists.map((playlist, index) => (
              <TreeItem
                key={`playlists-${index}`}
                nodeId={`playlists-${index}`}
                label={
                  <Typography variant="body2">{playlist}</Typography>
                }
              />
            ))}
          </TreeItem>
        )}

        {/* Global Settings */}
        {settings && Object.keys(settings).length > 0 && (
          <TreeItem
            nodeId="settings"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Info color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">Global Settings</Typography>
              </Box>
            }
          >
            {Object.entries(settings).map(([settingKey, settingValue]) => (
              <TreeItem
                key={`settings-${settingKey}`}
                nodeId={`settings-${settingKey}`}
                label={
                  <Typography variant="body2">
                    {settingKey}: {typeof settingValue === 'object' ? JSON.stringify(settingValue) : String(settingValue)}
                  </Typography>
                }
              />
            ))}
          </TreeItem>
        )}
      </>
    );
  };

  const getNodeDetails = () => {
    if (!selectedNode) return null;

    if (selectedNode.reference) {
      // File reference
      return (
        <Box>
          <Typography variant="h6" gutterBottom>File Reference Details</Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Reference</Typography>
            <Typography variant="body1">{selectedNode.reference}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Type</Typography>
            <Chip label={selectedNode.type} color={selectedNode.exists ? 'success' : 'error'} />
          </Box>

          {selectedNode.path && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Path</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{selectedNode.path}</Typography>
            </Box>
          )}

          {selectedNode.resolved_path && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Resolved Path</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{selectedNode.resolved_path}</Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip
              label={selectedNode.exists ? 'Found' : 'Missing'}
              color={selectedNode.exists ? 'success' : 'error'}
            />
          </Box>

          {selectedNode.asset_directory && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Asset Directory</Typography>
              <Typography variant="body1">{selectedNode.asset_directory}</Typography>
            </Box>
          )}
        </Box>
      );
    } else if (typeof selectedNode === 'object') {
      // Settings or other object
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Configuration Details</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(selectedNode, null, 2)}
          </pre>
        </Box>
      );
    } else {
      // Simple value
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Value</Typography>
          <Typography variant="body1">{String(selectedNode)}</Typography>
        </Box>
      );
    }
  };

  if (loading) {
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
          onClick={() => dispatch(fetchConfigStructure())}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (!structure?.data) {
    return (
      <Alert severity="info">
        No configuration structure available. The configuration may be empty.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Configuration Structure
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
          defaultExpanded={['libraries', 'playlists', 'settings']}
          onNodeSelect={handleNodeSelect}
          sx={{ flexGrow: 1, overflow: 'auto' }}
        >
          {renderTreeItems()}
        </TreeView>
      </Box>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configuration Node Details</DialogTitle>
        <DialogContent dividers>
          {getNodeDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigTreeViewer;