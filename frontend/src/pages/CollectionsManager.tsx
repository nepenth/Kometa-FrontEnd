import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const CollectionsManager: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>Collections Manager</Typography>
            <Paper sx={{ p: 3, minHeight: 400 }}>
                <Typography color="text.secondary">
                    Collection management interface will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default CollectionsManager
