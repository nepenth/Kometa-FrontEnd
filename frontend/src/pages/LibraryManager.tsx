import React, { useEffect, useState } from 'react';

import {
  LibraryBooks as LibraryIcon,
  Movie as MovieIcon,
  MusicNote as MusicIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Tv as TvIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { fetchLibraries, Library, runLibrary } from '../features/libraries/librariesSlice';
import { useAppDispatch, useAppSelector } from '../store';

const LibraryManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { libraries, loading, error } = useAppSelector((state) => state.libraries);
  const [searchTerm, setSearchTerm] = useState('');
  const [runningLibraries, setRunningLibraries] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchLibraries());
  }, [dispatch]);

  const handleRunLibrary = async (name: string) => {
    setRunningLibraries((prev) => new Set(prev).add(name));
    try {
      await dispatch(runLibrary({ name })).unwrap();
      // Optionally show success notification
    } catch (err) {
      console.error('Failed to run library:', err);
    } finally {
      setRunningLibraries((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const getLibraryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('movie')) return <MovieIcon />;
    if (lowerName.includes('show') || lowerName.includes('tv')) return <TvIcon />;
    if (lowerName.includes('music')) return <MusicIcon />;
    return <LibraryIcon />;
  };

  const filteredLibraries = libraries.filter((lib) =>
    lib.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && libraries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Error loading libraries: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Library Manager
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(fetchLibraries())}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search libraries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredLibraries.map((library) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={library.name}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                    }}
                  >
                    {getLibraryIcon(library.name)}
                  </Box>
                  <Typography variant="h6" component="div" noWrap>
                    {library.name}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {library.config.collection_files && (
                    <Chip label="Collections" size="small" color="secondary" variant="outlined" />
                  )}
                  {library.config.overlay_files && (
                    <Chip label="Overlays" size="small" color="info" variant="outlined" />
                  )}
                  {library.config.metadata_files && (
                    <Chip label="Metadata" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Tooltip title="Run Kometa for this library">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      runningLibraries.has(library.name) ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PlayArrowIcon />
                      )
                    }
                    onClick={() => handleRunLibrary(library.name)}
                    disabled={runningLibraries.has(library.name)}
                  >
                    {runningLibraries.has(library.name) ? 'Running...' : 'Run'}
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredLibraries.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="body1" color="text.secondary">
            No libraries found matching "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LibraryManager;
