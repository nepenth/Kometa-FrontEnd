import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const LogsViewer: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>System Logs</Typography>
            <Paper sx={{ p: 3, minHeight: 400, bgcolor: 'background.paper', fontFamily: 'monospace' }}>
                <Typography variant="body2" component="pre" sx={{ color: 'text.secondary' }}>
                    [INFO] Kometa started successfully
                    [INFO] Connected to Plex server
                    [INFO] Loading configuration...
                </Typography>
            </Paper>
        </Box>
    )
}

export default LogsViewer
