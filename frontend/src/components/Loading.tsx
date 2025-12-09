import React from 'react';

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading Kometa...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <CircularProgress size={60} thickness={4} color="primary" />
      <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, opacity: 0.8 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
